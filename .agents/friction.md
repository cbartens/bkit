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

## Drafts filename lacks descriptive slug (2026-05-06)

- **Category:** other
- **Workflow:** design
- **Step:** 8 — Close Workflow
- **Source:** orchestrator
- **Description:** Step 8 instructs `cp "$DESIGN_FINAL" "docs/plans/drafts/{FID}-design.md"` — produces filenames like `bar-138-design.md` with no topic slug. Inconsistent with `bar-120-managed-agents-runtime-plan.md` precedent in `docs/plans/drafts/`. Forces readers to open every file to know what it is. User had to ask for a manual rename post-merge.
- **Suggested fix:** Update Step 8 cp target to include a topic slug: `docs/plans/drafts/{FID}-{slug}-design.md`, where `{slug}` is the same kebab token already derived in Step 2 from Linear title (≤3 tokens, no stopwords). The `FID` derivation in Step 2 already produces `{issue-id}-{slug}` (e.g. `bar-138-gh-packages-distribution`); reusing that gives `{FID}-design.md` = `bar-138-gh-packages-distribution-design.md` for free IF Step 2 actually carries the slug into FID. Audit: in this run, `FID` resolved to bare `bar-138` (slug dropped), so Step 2's FID derivation is also part of the gap.
- **Related:** bar-138, commits `9d939ba` (initial generic name), `d237a9d` (manual rename to descriptive slug)
- **Recovery:** Manual `git mv docs/plans/drafts/bar-138-design.md → bar-138-gh-packages-distribution-design.md`.
- **Status:** RECOVERED

## Plan-workflow drafts filename also lacks descriptive slug (2026-05-06)

- **Category:** other
- **Workflow:** plan
- **Step:** 11 — Close Workflow
- **Source:** orchestrator
- **Description:** Step 11 cp target `docs/plans/drafts/{FID}-plan.md` mirrors the design-side bug — produces `bar-138-plan.md` (and `bar-138-plan-1.md`, `bar-138-plan-2.md` for splits) with no topic slug, while the precedent in `docs/plans/drafts/` is `bar-120-managed-agents-runtime-plan.md`. Same FID-derivation root cause as the design-side entry above.
- **Suggested fix:** Same as design-side fix — Step 1 FID derivation should produce `{issue-id}-{slug}` (e.g. `bar-138-gh-packages-distribution`); then `docs/plans/drafts/{FID}-plan.md` resolves to `bar-138-gh-packages-distribution-plan.md` for free. Apply the fix once at the FID-derivation step in `.agents/workflows/*` and BOTH design and plan close-workflow steps benefit.
- **Related:** bar-138, plan workflow drafts: `docs/plans/drafts/bar-138-plan.md`, `bar-138-plan-1.md`, `bar-138-plan-2.md`.
- **Recovery:** Pending — drafts left as `bar-138-plan*.md`; manual rename can follow design-side precedent post-merge.
- **Status:** OPEN

<!-- bkit:end -->
