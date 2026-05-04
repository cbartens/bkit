<!-- bkit:start -->

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
> - **Artifacts:** `docs/plans/completed/YYYYMM/{plan}.md`
> - **Summary:** what shipped (2–4 dense sentences)
> - **Related:** Linear IDs BAR-{N}, PRs PR-{N}, Commits {SHA}, Decisions DE-{N}, Knowledge KN-{N}, paths, etc
> ```

<!-- bkit:end -->

## bkit npm Package extraction — BAR-111 (2026-05-04)

- **Category:** agentic
- **Artifacts:** `docs/plans/completed/202605/bar-111-bkit-npm-package-plan.md` (master, trimmed manual runbook), `docs/plans/completed/202605/bar-111-bkit-npm-package-plan-{1,2,3}.md` (split sub-plans — A producer, B consumer migration, C smoke; only A executed in this repo, B and C remain in `app-gether-life`).
- **Summary:** Extracted canonical `.agents/` payload from `app-gether-life` into the standalone `bkit` repo. Implemented three CLI verbs (`init`, `install`, `check` — no `upgrade`, folded into install). `install` runs three passes: payload (mirrors `<pkg>/.agents/{workflows,prompts,templates}/` into consumer's `.agents/`), host (regen `.{claude,cursor}/{commands,agents}/` with T1/T2/T3 transforms), templates (managed-block updates per case 1/2/3a/3b). bkit-prefix ownership rule: bkit owns `bkit-*` files in six bkit-managed dirs; non-prefixed files are project-managed and never touched. Distributed as a **git dependency from a private GitHub repo** (`pnpm add -D github:cbartens/bkit#v0.1.1` + `pnpm.onlyBuiltDependencies` allowlist), not via npm registry — public scope `@bartens` was unpublished and renamed to `@cbartens` (matches GitHub identity). 63 vitest tests passing; smoke verified end-to-end via `pnpm pack` + consumer install in `www-visitfrasercoast-com`.
- **Related:** BAR-111, https://github.com/cbartens/bkit/releases/tag/v0.1.1, tag `v0.1.1` (commit `da1bdee`), tag `v0.1.0` (commit `fb34d28`). Sub-plans B (consumer migration) and C (second-repo smoke) are owned by `app-gether-life` and remain open in that repo's `docs/plans/drafts/`.
