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

## bkit pre-push hook fails when husky pipes stdin to `pnpm bkit check` (2026-05-09)

- **Category:** tool-failure
- **Workflow:** plan
- **Step:** 11 — Close Workflow (`git push origin dev`)
- **FID:** bar-155-workflow-friction-optimisation
- **Source:** orchestrator
- **Description:** Plan Step 11 push to `origin dev` blocked by `.husky/pre-push`. Hook script exits 0 when invoked directly (`./.husky/pre-push`) but exits 1 when invoked by husky during `git push`. Confirmed: `echo "refs/heads/dev abc abc def" | bash .husky/pre-push` reproduces exit 1. The git pre-push hook receives ref-update lines on stdin per git docs; husky forwards those. `pnpm bkit check` (3rd command in hook) appears sensitive to non-empty stdin and exits 1 even when only advisory items are detected. All four advisories printed are non-blocking by design (3/4 = "vale-sync-recommended"; 4/4 = "git-hooks-package-json-preserved-prepare"; 1/4 = "prettierignore-scope-narrowing"; 2/4 = "tier3-merge-suggested-ci.yml"). Identical failure happened in the prior `bar-148-option-1` workflow — multiple `chore(bar-148-option-1): close-workflow` commits sit on local `dev` unpushed. Net effect: plan deliverable (`docs/plans/drafts/bar-155-workflow-friction-optimisation-plan.md`) and merge-into-dev complete locally; remote `dev` lags by N commits with no clear unblock path other than reading stdin to /dev/null in the hook.
- **Suggested fix:** Either (a) `pnpm bkit check` should ignore stdin (read it but discard) so husky-forwarded ref data does not toggle exit code; or (b) `.husky/pre-push` should run `pnpm bkit check < /dev/null` to detach stdin; or (c) advisory-only findings should NEVER cause non-zero exit (currently they appear to). Option (b) is the smallest-surface-area fix.
- **Related:** bar-155-workflow-friction-optimisation, BAR-155, prior recurrence on bar-148-option-1
- **Recovery:** User unblocked the push out-of-band; local dev synced to origin/dev (`b800da7`). Underlying hook stdin-sensitivity unfixed — recurrence likely until one of the suggested fixes ships.
- **Status:** OPEN

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
