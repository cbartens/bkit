<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Completed

> [!CAUTION]
> **Purpose:** Ledger of shipped plans — one entry per merged feature. Append-only.
> **Categories:** `infra | agentic | backend | frontend | data | integrations | ai | testing | security | other`.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Append-only at EOF, do NOT overwrite.
> - `Summary` dense enough to grok without reading plan.
>
> **Format:**
>
> ```markdown
> ## Title (YYYY-MM-DD)
>
> - **Category:** {one of above}
> - **Artifacts:** `docs/plans/{YYYYMM}/{plan}.md`
> - **Summary:** what shipped (2–4 dense sentences)
> - **Related:** Linear IDs BAR-{N}, PRs PR-{N}, Commits {SHA}, Decisions DE-{N}, Knowledge KN-{N}, paths, etc
> ```

<!-- bkit:end -->
