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

<!-- Entries up to 2026-05-18 cleaned out after capture into BAR-155 (shipped) and BAR-230 (follow-ups). Harvest evidence preserved in those issues; recovered/duplicate entries removed. -->
