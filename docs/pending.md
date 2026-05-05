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

## v0.2: Remove `init` verb deprecation stub from bkit CLI (2026-05-04)

- **Type:** feature
- **Category:** agentic
- **Severity:** normal
- **Status:** open
- **Description:** `bkit init` verb kept as deprecation stub through v0.1.x per BAR-130. Kill-date: v0.2. Remove stub in bkit-cli.ts `parseArgs()` — `init` becomes an unknown verb (error). Update README + .agents/README.
- **Workaround:** Use `bkit install --full` instead.
- **Source:** agent
- **Related:** bar-130-ci-lint-scaffolding, BAR-130, BAR-200, DE-2, `.agents/scripts/bkit-cli.ts`

## v0.2: Remove `--host=` flag deprecation stub from bkit CLI (2026-05-04)

- **Type:** feature
- **Category:** agentic
- **Severity:** normal
- **Status:** open
- **Description:** `bkit install --host=claude|cursor` flags kept as deprecation stubs through v0.1.x per BAR-130. Kill-date: v0.2. Remove stubs in bkit-cli.ts — `--host=` becomes an unknown flag (error). Same sweep as `init` verb removal (single BAR-200 ticket covers both).
- **Workaround:** Use `bkit install --claude` or `bkit install --cursor` instead.
- **Source:** agent
- **Related:** bar-130-ci-lint-scaffolding, BAR-130, BAR-200, DE-2, `.agents/scripts/bkit-cli.ts`

## v0.2: Helper auth action `cbartens/bkit/.github/actions/setup-auth@v1` (2026-05-04)

- **Type:** feature
- **Category:** agentic
- **Severity:** low
- **Status:** deferred
- **Description:** Consumer CI currently requires manual `BKIT_READ_TOKEN` secret + git-config shim in ci.yml. A reusable GitHub Actions action `setup-auth@v1` would encapsulate this. Deferred from BAR-130 as out of scope v0.1.2.
- **Source:** agent
- **Related:** bar-130-ci-lint-scaffolding, BAR-130, BAR-131

## Future: `--no-X` invert flags and `--force` override for Tier 3 (2026-05-04)

- **Type:** feature
- **Category:** agentic
- **Severity:** low
- **Status:** open
- **Description:** `--no-claude`, `--no-cursor` invert flags to selectively skip modules; `--force` flag to override Tier 3 print-only behaviour (force-write even if dest exists). Neither is implemented in v0.1.2. Pending v0.2 CLI improvements.
- **Source:** agent
- **Related:** bar-130-ci-lint-scaffolding, BAR-130, BAR-200

## bkit-ship: auto-derive git tag from package.json version (2026-05-04)

- **Type:** feature
- **Category:** agentic
- **Severity:** normal
- **Status:** open
- **Description:** `bkit-ship.md` workflow does not currently auto-derive the release tag from `jq -r .version package.json`. When `package.json` version is bumped (e.g. to `0.1.2`), the ship workflow should automatically tag `v0.1.2` without requiring the version to be hardcoded anywhere in the workflow. Add a step that reads `VERSION=$(jq -r .version package.json)` and uses it for `git tag v${VERSION}` + `git push origin v${VERSION}`.
- **Workaround:** Human manually runs `git tag v0.1.2 && git push origin v0.1.2` after ship merge.
- **Source:** agent
- **Related:** bar-130-ci-lint-scaffolding, BAR-130, `.agents/workflows/bkit-ship.md`

## Future: `package.json` automated merging (2026-05-04)

- **Type:** feature
- **Category:** agentic
- **Severity:** low
- **Status:** open
- **Description:** `package.json` script entries are currently Tier 3 print-only (bkit prints suggested entries, consumer adds manually). Automated JSON merging (insert only missing keys) would reduce first-install friction. Deferred from BAR-130 as complex and risky for v0.1.2.
- **Source:** agent
- **Related:** bar-130-ci-lint-scaffolding, BAR-130, BAR-200

## MED-8: runPayload WriteSet threading (2026-05-05)

- **Type:** issue
- **Category:** testing
- **Severity:** normal
- **Status:** deferred
- **Description:** `runPayload` (workflows/prompts bkit-prefix sync + templates mirror) increments a local `writes` count but does NOT push path entries into `ws.writes`. Dry-run parity checks compare `ws.writes` paths, so `bkit check --core` and `bkit install --core` can agree on writeset paths while diverging by N actual file copies. Attempting to fix by threading `ws` into `runPayload/mirrorDirAlways` breaks all cross-module parity tests because `copyAdditive` (install-mode only, pre-`runPayload`) writes those same files first — making install see 0 additional writes while check sees N. Requires architectural merge of `copyAdditive` and `runPayload` into a single idempotent pass.
- **Workaround:** None. The drift is silent but low blast radius (internal payload files, not consumer outputs).
- **Source:** agent
- **Related:** bar-130-ci-lint-scaffolding, KN-1, `.agents/scripts/bkit-install.ts` (runPayload), `.agents/scripts/bkit-modules.ts` (runCoreModule)

## v0.2: Retire `{{PNPM_VERSION}}` token (2026-05-05)

- **Type:** issue
- **Category:** agentic
- **Severity:** low
- **Status:** open
- **Description:** After the BAR-130 ci hotfix, `{{PNPM_VERSION}}` is no longer substituted into any template (ci.yml templates removed `with.version:` in favour of `package.json#packageManager` as single SoT). `resolvePnpmVersion`, the field on `TokenMap`, and 4 tests in `bkit-tokens.test.ts` (+3 MED-2 warn tests) are dead code. Retire in v0.2 alongside the `init`/`--host=` deprecation removals.
- **Source:** agent
- **Related:** bar-130-ci-lint-scaffolding, BAR-130, BAR-200, KN-3, `.agents/scripts/bkit-tokens.ts`, `.agents/scripts/bkit-tokens.test.ts`

<!-- bkit:end -->
