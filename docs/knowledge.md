<!-- bkit:start -->

# Knowledge

> [!CAUTION]
> **Purpose:** Lessons, traps, post-mortems, gotchas (symptom → root cause → fix). Append-only.
> **ID:** `KN-{N}` — next = `max(grep 'KN-\d+') + 1`.
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
> ## KN-{N}: Title (YYYY-MM-DD)
>
> - **Category:** {one of above}
> - **Symptom:** observed (n/a for pattern/config)
> - **Root cause:** why
> - **Fix or rule:** action
> - **Type:** gotcha | pattern | config | dependency | workaround | post-mortem
> - **Confidence:** high | medium | low
> - **Severity:** critical | normal
> - **Source:** agent | human | phase
> - **Related:** {FID}, Linear IDs BAR-{N}, PRs PR-{N}, Commits {SHA}, Decisions DE-{N}, Knowledge KN-{N}, paths, etc
> ```

## KN-1: `runPayload` WriteSet threading breaks dry-run parity (2026-05-05)

- **Category:** testing
- **Symptom:** Threading `ws` into `runPayload/mirrorDirAlways` causes parity tests to fail with check having ~5x more paths than install.
- **Root cause:** `copyAdditive` (install mode only) writes `.agents/workflows/**` and `.agents/templates/**` BEFORE `runPayload` runs. So `runPayload` finds them equal in install (0 additional writes) but absent in check/dry-run (N writes). If `runPayload` tracks these in `ws`, check and install diverge.
- **Fix:** Exclude `.agents/templates/**` (mirrorDirAlways) and `.agents/{workflows,prompts}/` bkit-prefix files from `ws` tracking inside `runPayload`. They are internal payload management, not consumer outputs. The dry-run parity tests (cross-module) intentionally filter `.agents/templates/**` paths — any attempt to track them must also account for `copyAdditive` pre-write in install mode.
- **Related:** bar-130-ci-lint-scaffolding, MED-8

## KN-2: `postDispatch` pattern for deferred finalisation (2026-05-05)

- **Category:** agentic
- **Symptom:** `.bkit-version` written in `runCoreModule` (first module) means a crash in any subsequent module leaves it on disk, suppressing the first-install banner on retry.
- **Root cause:** `isFirstInstall` signal is captured at start of core, but the version file was written immediately, before subsequent modules ran.
- **Fix:** Added `postDispatch: Array<() => void>` to `ModuleContext`. `runCoreModule` pushes the `.bkit-version` write as a deferred callback. `dispatchModules` flushes all `postDispatch` callbacks AFTER all modules complete. Tests that called `runCoreModule` directly must call `flushPostDispatch(ctx)` (or use `dispatchModules`) to observe `.bkit-version` on disk.
- **Related:** bar-130-ci-lint-scaffolding, MED-4

<!-- bkit:end -->
