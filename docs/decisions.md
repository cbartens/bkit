<!-- bkit:start -->

# Decisions

> [!CAUTION]
> **Purpose:** ADRs — what was decided, why, discarded alternatives. Append-only.
> **ID:** `DE-{N}` — next = `max(grep 'DE-\d+') + 1`.
> **Categories:** `infra | agentic | backend | frontend | data | integrations | ai | testing | security | other`.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Append-only at EOF, do NOT overwrite.
> - Grep keywords/categories first → read only relevant, no dupes.
>
> **Format:**
>
> ```markdown
> ## DE-{N}: Title (YYYY-MM-DD)
>
> - **Category:** {one of above}
> - **Status:** active | superseded | deferred
> - **Decision:** what
> - **Why:** reasoning
> - **Discarded:** alternatives (omit if none)
> - **Superseded by:** DE-{N} (only if superseded)
> - **Source:** agent | human | phase
> - **Related:** {FID}, Linear IDs BAR-{N}, PRs PR-{N}, Commits {SHA}, Decisions DE-{N}, Knowledge KN-{N}, paths, etc
> ```

<!-- bkit:end -->
