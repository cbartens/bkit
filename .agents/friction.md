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

## Canonical design copy lost on worktree teardown (2026-05-06)

- **Category:** destructive-backout
- **Workflow:** design
- **Step:** 8 — Close Workflow
- **Source:** orchestrator
- **Description:** Step 8 instructions run `cp "$DESIGN_FINAL" "docs/plans/drafts/{FID}-design.md"` inside the worktree, then merge `feat/{FID}` → `dev` and remove the worktree. The cp creates an uncommitted working-tree change on the feature branch; if the orchestrator switches to `dev` and merges before committing the cp, the merge carries `docs/plans/logs/{FID}/` but NOT `docs/plans/drafts/{FID}-design.md`. `git worktree remove --force` then deletes the uncommitted file. Result: canonical design output silently missing on `dev`; verdict-header strip step also skipped. User caught it manually.
- **Suggested fix:** Reorder Step 8 — either (a) commit the drafts copy on the feature branch BEFORE merging to `dev`, or (b) move the `cp` + verdict-strip to run on `dev` AFTER the merge, before worktree removal. Option (b) avoids any worktree-state coupling. Add an explicit verification check: `[ -f docs/plans/drafts/{FID}-design.md ]` before pruning the worktree, fail loud if missing. Also explicitly script the verdict-header strip (`sed -i '' '/^Verdict:/,/^<!-- verdict:end -->$/d'`) rather than relying on the checklist item being remembered.
- **Related:** bar-138, commits `dcc10ad` (close-workflow on dev, missing cp), `9d939ba` (manual recreate from logs), `9ef9c43` (verdict header strip)
- **Recovery:** Manual recreate by re-copying `docs/plans/logs/bar-138/design-v2-reviewed.md` → `docs/plans/drafts/bar-138-design.md` on `dev`, then stripped verdict header per checklist requirement.
- **Status:** RECOVERED

<!-- bkit:end -->
