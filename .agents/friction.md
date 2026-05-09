<!-- bkit:start -->

# Friction

> [!CAUTION]
> **Purpose:** Friction log — moments where orchestrator or subagents needed human action, rework, or recovery. Drives prompt and guardrail refinement.
> **Categories:** `human-confirm | permission-prompt | agent-rework | manual-install | tool-failure | destructive-backout | other`.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Append-only at EOF, do NOT overwrite.
> - Once written, ONLY edit `Recovery` / `Status` as required; NEVER edit `Description` / `Suggested fix`.
>
> **Format:**
>
> ```markdown
> ## {Title} (YYYY-MM-DD)
>
> - **Category:** {one of above}
> - **Workflow:** design | plan | build | debug | ship
> - **Step:** {N} — {Step Name} (or `orchestrator` if outside a step)
> - **Source:** orchestrator | {subagent-name}
> - **Description:** what happened, what action was needed
> - **Suggested fix:** prompt/guardrail change to consider (omit if none)
> - **Related:** {FID}, Linear IDs BAR-{N}, PRs PR-{N}, Commits {SHA}, paths, etc
> - **Recovery:** what unblocked it (manual fix, subagent retry, workaround in commit `{SHA}`, n/a)
> - **Status:** `OPEN` (default) | `RECOVERED` | `FIXED-IN: {REF}`
> ```

<!-- bkit:end -->

## Plan-execute agent returned PENDING verdict after ~20min (2026-05-06)

- **Category:** agent-rework
- **Workflow:** build
- **Step:** 5 — Plan Execute
- **FID:** bar-141-preflight-checklist
- **Source:** subagent
- **Description:** `@bkit-build-plan-execute` ran for 1188887ms (~20min) and returned with log file containing only `Verdict: PENDING` (6 lines). The agent did substantial implementation work (created bkit-preflight.ts, bkit-postinstall.ts, test files, modified bkit-install.ts) but never wrote the final log summary or updated the verdict. Orchestrator had to re-invoke the agent with context about completed work to finish the log.
- **Suggested fix:** Add a hard timeout guard to plan-execute prompt — if the agent detects it's near context/time limits, it should immediately write a partial log with CONCERNS verdict and list remaining gaps rather than failing silently. Alternatively, split large implementation tasks into smaller sub-plans so each execute agent session is bounded.
- **Recovery:** Re-invoked `@bkit-build-plan-execute` with explicit context listing what was already done. Second invocation completed in ~4min and produced valid PASS verdict.
- **Status:** RECOVERED

## bkit-plan-generate stream-timeout on multi-issue plan input (2026-05-06)

- **Category:** tool-failure
- **Workflow:** plan
- **Step:** 3 — Generate Plan
- **Source:** bkit-plan-generate
- **Description:** Subagent ran ~8 min / 43 tool uses on 32KB `plan-input.md` covering BAR-131/139/142 and hit `API Error: Stream idle timeout - partial response received`. No output file produced.
- **Suggested fix:** When unified plan input >25KB or covers >2 Linear issues, orchestrator should split generate-plan into per-phase invocations (one subagent call per phase) and concatenate, OR have the subagent write incrementally with periodic flushes. Consider a `plan-input-size` advisory in workflow Step 3.
- **Related:** bar-131-related-bars-suite, BAR-131, BAR-139, BAR-142
- **Recovery:** Retried with focused/incremental-write prompt (skip codebase deep-dive, write skeleton + per-phase tables, save after each section). Retry succeeded.
- **Status:** RECOVERED

## Multi-conflict rebase on long-lived feat branch — manual resolution loop (2026-05-08)

- **Category:** human-confirm
- **Workflow:** ship
- **Step:** 2 — Worktree Setup
- **FID:** bar-131-related-bars-suite
- **Source:** orchestrator
- **Description:** `git rebase origin/dev` on a 50-commit feature branch produced 5 sequential conflict commits across `docs/knowledge.md` (twice — KN-8 widening then KN-9/KN-10 collision with parallel BAR-146 entries needing renumber to KN-12/KN-13), `docs/deployments.md` (incoming "Consumer scope" bullet vs HEAD's two new sub-sections), `.agents/rules.md` (incoming Pre-push Checklist subsection vs HEAD's narrower bullets), `.husky/pre-push` + `.agents/templates/.husky/pre-push` (architectural divergence: feat branch put `pnpm bkit check` INSIDE bkit-managed block thus pushing to consumers; HEAD's recent `1e155ff` chose bkit-repo-only outside markers). Workflow Step 2 only says `git rebase origin/dev || { echo "Rebase conflict — resolve manually"; exit 1; }` — it has no semantic guidance on how to resolve, no auto-renumber for collision-prone IDs (KN-{N}), and no preference between competing template designs.
- **Suggested fix:** Workflow Step 2 should detect conflict shape and offer guidance: (1) for `docs/knowledge.md` KN-{N} numeric collisions, auto-renumber feature branch's contested IDs by next-available-greater integer + grep for cross-references; (2) for `.agents/templates/*` vs `.agents/*` design conflicts, prefer the more recent decision direction (latest commit on either side wins, with the user-confirmed preference recorded as a one-line memory check); (3) on rebase abort, write a `ship-rebase-conflict-{N}.md` summary so the next session can pick up. Also: 50-commit feat branches should have triggered an early "rebase regularly" advisory during build, not deferred all conflicts to ship.
- **Related:** bar-131-related-bars-suite, BAR-131, conflicts vs commits 188b1c6 / 54805f3 / 83d69fc / 1e9f131, KN-12 / KN-13, `.husky/pre-push`
- **Recovery:** Manually resolved all 5 conflict commits in-place during ship Step 2; renumbered feature's KN-9/KN-10 to KN-12/KN-13 (no cross-references found via `git grep`); reverted template auto-merge to keep `pnpm bkit check` outside markers (per auto-memory "bkit-repo dev pain vs consumer pain — don't conflate"); force-with-lease pushed rebased branch; CI run #25538826802 green.
- **Status:** RECOVERED

## bkit-build-challenge subagent budget exhaustion (BAR-93 re-run) (2026-05-08)

- **Repo:** app-gether-life
- **FID:** bar-93-members-colours-tagging
- **Step:** 9 (Build Challenge)
- **Symptom:** Subagent ran 59 tool calls / 108k tokens / 226s and returned without writing the verdict — `build-challenge.md` ended at `Verdict: PENDING`.
- **Recovery:** Restored prior `build-challenge.md` from git (commit `02100959`); the diff on this branch is identical to the prior run's, so the 9 findings still apply.
- **Status:** Workaround applied; Step 10 (challenge-remediate) will address the 4 CRITICAL/HIGH findings.
- **Pattern:** Independent-review subagents on diffs > ~2k lines may need a more focused brief (probe specific risk areas, not full freeform review) to fit within budget.

## Build failure-path leaves stale lock in main repo (2026-05-09)

- **Category:** other
- **Workflow:** build → debug
- **Step:** orchestrator (lock cleanup in Failure Path)
- **FID:** bar-148-option-1
- **Source:** orchestrator
- **Description:** Build Step 1 acquires lock in main repo working directory (`docs/plans/logs/{FID}/.lock`). Build Failure Path runs from worktree context; `rm -f "docs/plans/logs/{FID}/.lock"` resolves to the worktree's lock, not the main repo's. Main repo lock is never removed. Debug workflow blocked with "lock <2h old" on next invocation. Additionally, if debug Step 1 commits status.json to dev and Step 2 rebases worktree on dev, a status.json conflict arises (dev has partial build steps + debug entry; feature branch has full build steps). To avoid both issues, all debug steps should run from inside the worktree, not the main repo.
- **Suggested fix:** Failure Path should delete the lock at an absolute path (`$(git rev-parse --show-toplevel)/docs/plans/logs/{FID}/.lock`) so it works regardless of cwd. Alternatively, Step 1 should always run from the worktree, not the main repo, so lock and status.json paths are consistent.
- **Related:** bar-148-option-1, build lock `2026-05-09T00:25:04Z`
- **Recovery:** Manually removed stale lock; debug workflow runs entirely from worktree to avoid rebase conflict.
- **Status:** RECOVERED

## Subagent context exhaustion on large plan-execute (2026-05-06)

- **Category:** agent-rework
- **Workflow:** build
- **Step:** 5 — Plan Execute (sub-plan 1/1)
- **Source:** bkit-build-plan-execute
- **Repo:** visitfrasercoast-com
- **Description:** Sub-plan 1 (31 tasks, bootstrap monorepo from app-gether-life) is the largest single sub-plan in the project. Each agent invocation hit context limits mid-execution (cutoffs at Task 1.14, Task 1.19, Task 1.21) and returned without writing the log file. Orchestrator had to re-invoke 3 times with explicit "resume from Task N" prompts before the log file was produced. Root cause: 31 tasks × source-copy + file-create operations each consume significant context; a single agent invocation is insufficient for this scope. Same pattern repeated on plan-verify (cutoff mid-checklist update, required 2 continuations).
- **Suggested fix:** (1) Break plan-execute for plans with >20 tasks into task-range invocations (e.g. "Tasks 1–15", "Tasks 16–31") at orchestrator level; re-join into single log. (2) Add task-range parameter to bkit-build-plan-execute prompt template. (3) Alternatively, enforce sub-plan task cap of ≤15 at plan-generate time.
- **Related:** bar-102-digital-agent-mvp, BAR-132, sub-plan 1 (31 tasks)
- **Recovery:** 3× manual re-invocations of bkit-build-plan-execute with explicit resume-task context. Build continued successfully.
- **Status:** RECOVERED

## build-challenge-remediate skipped bkit install after editing canonical file (2026-05-09)

- **Category:** agent-rework
- **Workflow:** build
- **Step:** 10 — Build Challenge Remediate
- **FID:** bar-148-option-1
- **Source:** bkit-build-challenge-remediate
- **Description:** Remediate subagent fixed `.agents/workflows/bkit-ci-router.md` (canonical) and `.claude/commands/bkit-ci-router.md` (Claude mirror) for the FID directory-scan bug, but did NOT run `bkit install` to regenerate `.cursor/commands/bkit-ci-router.md`. Cursor mirror retained the old buggy directory-scan code. Second build-challenge (attempt 1) caught the stale mirror, triggering FAIL and Failure Path.
- **Suggested fix:** Add explicit instruction to challenge-remediate prompt: "After editing any `.agents/workflows/*.md` canonical file, run `pnpm bkit install` to regenerate all mirrors before returning." Alternatively, remediate subagent should always check `.agents/rules.md` § bkit Repo Authoring which already states "After editing .agents/\* run bkit install".
- **Related:** bar-148-option-1, build-challenge attempt 1
- **Recovery:** User directed in-session fix: ran `pnpm bkit install` in worktree to regenerate cursor mirror; continued build workflow from fresh start-workflow step without full restart.
- **Status:** RECOVERED
