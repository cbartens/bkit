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


---

## SHIP-BAR-130-1: Stale debug lock on dev at ship start

**Date:** 2026-05-05
**Workflow:** ship / Step 1
**Description:** Lock `docs/plans/logs/bar-130-ci-lint-scaffolding/.lock` existed on `dev` (age ~47m, < 2h threshold) from the debug workflow. Debug workflow DID complete on `fix/bar-130-ci-pnpm` branch (close-workflow removed lock there) but `dev` hadn't received those changes yet via PR merge. Lock was a false positive — no workflow was actually running.
**Recovery:** Checked debug workflow completion in worktree status.json, confirmed IN_PROGRESS entry had no downstream steps beyond `start-workflow` (pre-PR context), and that fix/bar-130-ci-pnpm branch has full debug close-workflow done. Removed stale lock and re-acquired for ship workflow.
**Status:** RECOVERED
