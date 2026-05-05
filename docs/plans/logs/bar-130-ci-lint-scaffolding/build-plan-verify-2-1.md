# Build Plan Verify — Sub-plan 2, attempt 1

**FID:** bar-130-ci-lint-scaffolding
**Sub-plan:** 2/3 (Scope B — installer engine)
**Verdict:** PASS
**Failures:** 0

## Sub-plan checklist coverage

- **Phase 0 (test scaffolding)** — verified. All five stub/test files exist:
  - `.agents/scripts/bkit-tokens.test.ts` (filled, 16 tests)
  - `.agents/scripts/bkit-tiers.test.ts` (filled, 14 tests across Tier 1/2/3 + html/hash variants + dry-run)
  - `.agents/scripts/bkit-dry-run-parity.integration.test.ts` (filled — 4 active tests + 5 `it.todo` v4-3 stubs)
  - `.agents/scripts/bkit-modules.integration.test.ts` (filled — 2 active tests for Task 6.1b + 6 `it.todo` v4-3 stubs)
  - `.agents/scripts/bkit-cli.test.ts` (stub-only with 5 `it.todo` for v4-3, per Phase 0 instructions)
- **Phase 1 (token resolver)** — verified. `bkit-tokens.ts` exports `resolveTokens(cwd)` returning `TokenMap` with documented fallbacks: `.nvmrc` → `engines.node` → `"22"`; `packageManager pnpm@X` → `"10"`; `git symbolic-ref` → `"main"`; `package.json.name` required (hard-fails). `applyTokens` substitutes `{{TOKEN}}` placeholders write-time. Tests cover all four resolution chains plus write-time semantics.
- **Phase 2 (tier writers + marker generalisation)** — verified. `bkit-tiers.ts` exports `writeTier1`, `writeTier2`, `writeTier3` accepting a `WriteSet` accumulator. `bkit-install.ts` adds `MarkerStyle = "html-comment" | "hash-comment"`, generalises `findLineAnchoredMarkers`, `extractManagedBlock`, `extractFullManagedBlock`, `updateManagedBlock` with default `"html-comment"` (backward-compat preserved — verified by explicit default-arg backward-compat tests in `bkit-install.test.ts`). Hash-comment round-trip on YAML/INI/shell asserted.
- **Phase 5 (dry-run parity `WriteSet`)** — verified. `runTemplates` returns `{ writes, writeSet: WriteEntry[] }`. The four parity tests in `bkit-dry-run-parity.integration.test.ts` assert path-set equality between dry-run and live-run for rule 1 (dest missing), rule 3a (the 14-vs-15 regression), rule 2 (markers present), and a 3-template multi-file scenario. Cross-module parity stubs (`it.todo`) are deferred to v4-3 per the plan note in Task 5.3.
- **Phase 6 (template payloads)** — verified. All required templates exist:
  - `.agents/templates/.github/workflows/ci.yml` — `# bkit:start` … `# bkit:end` with placeholders `{{NODE_VERSION}}` (line 16), `{{PNPM_VERSION}}` (line 20), `{{DEFAULT_BRANCH}}` (line 6); auth-shim line 23 BEFORE `pnpm install --frozen-lockfile` line 26.
  - `.agents/templates/.vale.ini` — Tier 2 hash-comment block.
  - `.agents/templates/.vale/styles/House/{Hedging,LLMSlop,...}.yml` — Tier 1 payload.
  - `.agents/templates/slop-scan.config.json` — Tier 3 verbatim seed.
  - `.agents/templates/.prettierignore` — Tier 2 hash-comment block.
  - `.agents/templates/.husky/pre-commit` (`pnpm lint:prose && pnpm lint:slop`) and `pre-push` (`pnpm typecheck && pnpm test`) — both with hash-comment markers.
  - `.agents/templates/.cursor/hooks.json` (Tier 1) and `.cursor/settings.json` (Tier 3).

## Diff review

- **`bkit-tokens.ts`** — clean interface; hard-fails with non-zero exit via thrown Error when `package.json.name` missing or `package.json` absent (covered by two tests). `extractNodeMajor` correctly handles `^`/`~`/`>=`/`v` prefixes.
- **`bkit-tiers.ts`**:
  - Tier 1: Idempotent — early return when `existing === srcContent` (no double-count). `WriteSet` only pushed when an actual write/rewrite occurs.
  - Tier 2: Append-at-EOF when destination has no markers (consumer content preserved with smart `\n` separator); update-only-block when markers present. Uses `extractFullManagedBlock` + `applyTokens` correctly.
  - Tier 3: Print-only (suggested diff to `printSink`) when destination present and content differs; writes only when absent. WriteSet accumulator records dry-run prediction equally.
- **`bkit-install.ts`** — `markerStyle?: MarkerStyle = "html-comment"` argument added to all four exported marker functions; default-arg backward-compat verified by explicit regression tests. New `WriteSet`/`WriteEntry` types exported. `runTemplates` returns both `writes` (count) and `writeSet` (path-level entries) populated identically by both dry-run and live-run paths.
- **`.agents/templates/.github/workflows/ci.yml`** — Auth-shim line literally `git config --global url."https://x-access-token:${{ secrets.BKIT_READ_TOKEN }}@github.com/".insteadOf "https://github.com/"` is present at line 23, between `# bkit:start` (line 1) and `# bkit:end` (line 45), and BEFORE `pnpm install --frozen-lockfile` (line 26). Asserted by automated test in `bkit-install.test.ts` (lines 703–743).

## Findings

None.

## Decision

PASS — all 20 runbook tasks across Phases 0/1/2/5/6 verified against codebase artifacts. No premature ticks discovered. Task 6.1's auth-shim assertion is automated; Task 6.1b's end-to-end integration test passes the integrated `resolveTokens → applyTokens → writeTier2` path; dry-run parity test pins the 14-vs-15 regression at path-level granularity. Default-arg backward-compat preserved (verified by explicit regression test asserting hash markers are NOT matched when `markerStyle` defaults).

<!-- verdict:end -->
