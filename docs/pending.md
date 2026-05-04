<!-- bkit:start -->

# Pending

> [!CAUTION]
> **Purpose:** Ledger of deferred issues and future feature ideas. Append-only.
> **Categories:** `infra | agentic | backend | frontend | data | integrations | ai | testing | security | other`.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Append-only at EOF, do NOT overwrite.
> - Cross-doc: grep any `DE-\d+`/`KN-\d+` across `decisions.md` / `knowledge.md`.
>
> **Format:**
>
> ```markdown
> ## Title (YYYY-MM-DD)
>
> - **Type:** issue | feature
> - **Category:** {one of above}
> - **Severity:** critical | normal | low
> - **Status:** open | resolved | deferred
> - **Description:** what's wrong/risky/planned
> - **Workaround:** mitigation (omit if none)
> - **Source:** agent | human | phase
> - **Related:** {FID}, Linear IDs BAR-{N}, PRs PR-{N}, Commits {SHA}, Decisions DE-{N}, Knowledge KN-{N}, paths, etc
> ```

<!-- bkit:end -->

## `init` README doc clarity — auto-runs `install` (2026-05-04)

- **Type:** issue
- **Category:** agentic
- **Severity:** low
- **Status:** open
- **Description:** Root `README.md` § Install + `.agents/README.md` § Install / regenerate describe `init`, `install`, and `check` as three distinct verbs. In practice, `init` calls `install` at the end (per the agreed v0.1.0 design — init = additive `.agents/` copy + write `.bkit-version` + delegate to install). Doc currently reads as if `install` is a separate user step after `init`. Tighten copy: state explicitly that `init` is bootstrap + first install in one shot, and consumers only re-run `install` for ongoing sync after `pnpm update @bartens/bkit`.
- **Source:** human (smoke feedback)
- **Related:** BAR-111, comment `ce1800ae`, `README.md`, `.agents/README.md`

## `bkit check` log prefix says `[bkit-install]` in dry-run mode (2026-05-04)

- **Type:** issue
- **Category:** agentic
- **Severity:** low
- **Status:** open
- **Description:** When running `pnpm exec bkit check`, the script (`.agents/scripts/bkit-install.ts`) emits log lines prefixed `[bkit-install]` even though the verb is `check`. Confusing when scanning CI / smoke output to confirm which verb actually ran. Fix: in `main()`, when `dryRun=true` (i.e. `verb === "check"`), use prefix `[bkit-check]` (or alternatively `[bkit-install] (check)`) for all `console.log` / `console.warn` / `console.error` calls. ~1-line change to a helper plus updates to existing log statements. Land in `v0.1.1`.
- **Source:** human (smoke feedback)
- **Related:** BAR-111, comment `ce1800ae`, `.agents/scripts/bkit-install.ts`
