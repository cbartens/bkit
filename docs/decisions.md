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

## DE-1: Three-tier file-ownership model for bkit installer (2026-05-04)

- **Category:** agentic
- **Status:** active
- **Decision:** Use a three-tier file-ownership model: Tier 1 (fully managed — idempotent rewrite), Tier 2 (managed-block — bkit owns between `bkit:start`/`bkit:end` markers, consumer owns outside), Tier 3 (seed-or-print — write if absent, print suggestion if present).
- **Why:** Different files have different consumer-customisation needs. CI workflows and lint config have bkit-provided structure but consumers may add jobs/rules. JSON config like `.cursor/settings.json` is too project-specific to touch on updates. Managed-block (Tier 2) enables bkit to inject and update its own content without clobbering consumer customisations, matching what the `rules.md` + `.gitignore` marker convention already proved out.
- **Discarded:** 3-way merge (overkill for v0.1.x), full-file ownership for all files (clobbers consumer CI jobs), write-if-missing only (no update path for stale bkit blocks).
- **Source:** agent
- **Related:** bar-130-ci-lint-scaffolding, BAR-130, `.agents/scripts/bkit-tiers.ts`, `.agents/scripts/bkit-modules.ts`

## DE-2: Composable module-flag CLI (collapse init+install+--host=) (2026-05-04)

- **Category:** agentic
- **Status:** active
- **Decision:** Replace `bkit init` + `bkit install --host=claude|cursor` triad with a single `bkit install` verb taking composable module flags (`--core`, `--claude`, `--cursor`, `--ci`, `--lint`, `--git-hooks`, `--full`). `--core` is implicitly prepended to any module set. No flags = `--full`. `init` and `--host=` kept as deprecation stubs through v0.1.x with kill-date v0.2.
- **Why:** Three separate entry-points (`init`, `install`, `check` + `--host=`) conflated one-time setup with ongoing sync and per-host scoping. Module flags make it composable (`--ci --lint` seeds only those stacks), testable (each module fn isolated), and extensible (new modules don't require new verbs). Deprecation stubs preserve backward compat through v0.1.x.
- **Discarded:** Separate `init` verb (collapses to `install --full`), `--host=` flag (collapses to `--claude`/`--cursor`), prompted fallback for unknown hosts (out of scope v0.1.2).
- **Source:** agent
- **Related:** bar-130-ci-lint-scaffolding, BAR-130, BAR-112, BAR-200 (kill-date tracking), `.agents/scripts/bkit-cli.ts`, `.agents/scripts/bkit-modules.ts`

<!-- bkit:end -->
