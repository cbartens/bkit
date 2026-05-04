# BAR-130 v4-2 — bkit-the-Installer Engine (Scope B) Implementation Plan

**Parent Plan:** [`bar-130-ci-lint-scaffolding-plan.md`](./bar-130-ci-lint-scaffolding-plan.md)
**Master full plan (v3 — checked):** [`plan-v3-checked.md`](./plan-v3-checked.md)
**Sibling order:** v4-1 → v4-2 (this) → v4-3.
**Prerequisites:** v4-1 must complete first (lint scripts + prettier devDep + bkit's own CI workflow must exist before v4-2's pre-PR gates run).

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this `bar-130-ci-lint-scaffolding-plan-2.md` natively via `Read` _before_ executing any steps.
> 2. NEVER trust system summaries or prior conversation to determine what is done.
> 3. Source of truth: literal `[x]` vs `[ ]` checkboxes below.

## Context & Goals

bkit-the-installer must scaffold the same gate stack into consumer repos that bkit-the-repo enforces on itself (v4-1). This child builds the **engine**: token resolver, generalised marker parser (HTML-comment + hash-comment variants), tier writers (Tier 1 fully managed, Tier 2 managed-block, Tier 3 seed-or-print), dry-run/install parity fix via shared `WriteSet` accumulator, and all `.agents/templates/` payload files (`ci.yml` with auth-shim, `.vale.ini`, `.vale/styles/House/`, `slop-scan.config.json`, `.prettierignore`, `.husky/pre-{commit,push}`, `.cursor/{hooks,settings}.json`).

**Out of scope here (deferred to v4-3):** module-flag CLI surface (`bkit-cli.ts`), module dispatcher (`bkit-modules.ts`), `bkit-install.ts` `main()` refactor, deletion of `bkit-init.ts`, README + `.agents/README.md` rewrites, `docs/decisions.md` / `docs/pending.md` appends, version bump, manual smoke gates.

**Success Criteria (this child):**

- `resolveTokens(cwd)` resolves `{{NODE_VERSION}}`, `{{PNPM_VERSION}}`, `{{DEFAULT_BRANCH}}`, `{{PROJECT_NAME}}` from project state with documented fallbacks (and hard-fails on missing `package.json.name`).
- `findLineAnchoredMarkers` + `extractManagedBlock` + `extractFullManagedBlock` + `updateManagedBlock` accept an optional `markerStyle` arg (default `"html-comment"` — backward compat); hash-comment variant round-trips on YAML / INI / shell.
- Tier 1 / Tier 2 / Tier 3 writer functions exist in `bkit-tiers.ts` and pass colocated unit tests.
- Shared `WriteSet` accumulator is populated identically by both `bkit check` and `bkit install` paths — `check --full` writeset ≡ `install --full` writeset (regression of 14-vs-15 bug from `app-gether-life`).
- All template payloads exist under `.agents/templates/`. `ci.yml` template includes auth-shim line literally between `# bkit:start` / `# bkit:end` markers and BEFORE `pnpm install --frozen-lockfile`.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Inherited verbatim from the master plan; Concrete Example below is the v4-2 specialisation.

### Narrative _(inherited from master)_

A consumer adds `@cbartens/bkit@v0.1.2` to their repo, runs `bkit install --full` once on a non-empty project, and gets a complete, idempotent agent + CI + lint + git-hooks stack — bkit-managed blocks injected without clobbering existing files, tokens (`{{NODE_VERSION}}`, `{{PNPM_VERSION}}`, `{{DEFAULT_BRANCH}}`, `{{PROJECT_NAME}}`) substituted from project state, dry-run/install parity preserved, and the private-repo CI auth-shim seeded so first PR CI passes.

### Success Criteria _(inherited from master, full set; this child closes #3, #4 fully and contributes to #1)_

1. `bkit install` (no flags ≡ `--full`) on empty repo seeds files across all three tiers.
2. Selective module install seeds only the requested modules + `--core` (closed in v4-3 via dispatcher).
3. **`bkit install --ci` on existing customised `ci.yml` injects the bkit-managed `bkit-gates` job inside markers without clobbering consumer's other jobs; substitutes Node/pnpm/branch values from project state.** ← THIS CHILD.
4. **`bkit check --full` writeset equals `bkit install --full` writeset for any starting state (regression test with mock fs).** ← THIS CHILD.
5. `bkit init` and `bkit install --host=claude` print deprecation warn and run the new equivalent (closed in v4-3).

### Concrete Example _(v4-2 specialisation — token-substituted Tier 2 write on existing `ci.yml`)_

**Setup:** Tmpdir pre-seeded with:

- `.nvmrc` containing `22\n`.
- `package.json` containing `{"name":"x","packageManager":"pnpm@10.4.1"}`.
- `git init` with default branch `main`.
- An existing `.github/workflows/ci.yml` with two consumer-owned jobs (NO `bkit-managed` markers).

**Steps:**

1. Test setup invokes `resolveTokens(cwd)` → returns `{ NODE_VERSION: "22", PNPM_VERSION: "10", DEFAULT_BRANCH: "main", PROJECT_NAME: "x" }`.
2. Test invokes `writeTier2(srcPath, ".github/workflows/ci.yml", tokens, "hash-comment", false)`.
3. Tier 2 writer reads existing file, sees no markers, appends `# bkit:start` / `# bkit:end` block at EOF with `applyTokens` already substituted.
4. On-disk `.github/workflows/ci.yml` now contains: consumer's original two jobs unchanged + bkit block at EOF with `node-version: 22`, `version: 10` (pnpm/action-setup), `branches: [main]`, auth-shim line literally inside the block.

**Outcome:** Existing `ci.yml` is preserved; bkit block is appended; tokens are resolved; `{{NODE_VERSION}}` / `{{PNPM_VERSION}}` / `{{DEFAULT_BRANCH}}` placeholders are NOT present in the on-disk file.

### Edge Cases _(filtered from master to v4-2's surface)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| `ci.yml` exists with consumer customisations + no bkit markers | Append `# bkit:start … # bkit:end` block at EOF containing `bkit-gates` job; preserve consumer jobs above |
| `slop-scan.config.json` exists (Tier 3, comment-less JSON) | Preserve consumer file; print suggested diff to stdout; exit 0 (Tier 3 writer behaviour) |
| `.nvmrc` absent + `package.json.engines.node` absent | `{{NODE_VERSION}}` falls back to default `22`; `resolveTokens` does NOT throw |
| `package.json.name` absent | `resolveTokens` hard-fails with non-zero exit + clear error (`{{PROJECT_NAME}}` is required) |
| Mid-install crash between Tier 1 rewrite and Tier 2 update | `WriteSet` accumulator records the partial; rerun fixes (non-atomicity accepted for v0.1.2). v4-3 enforces `.bkit-version` write-LAST ordering. |
| `bkit check --ci` on repo where `ci.yml` block content is stale | Exits non-zero (writeset non-empty); subsequent `install --ci` writes the new block; second `check --ci` exits 0 |

### Derived Test Matrix _(v4-2 subset)_

> Each row → one Agent Execution Runbook task. v4-2 owns 14 of the master's 21 Test Matrix rows.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Token resolver: `.nvmrc` → major; `package.json.engines.node` fallback; default `22` | Unit | `.agents/scripts/bkit-tokens.test.ts` |
| Token resolver: `package.json.packageManager` `pnpm@10.4.1` → `10`; default `10` | Unit | `.agents/scripts/bkit-tokens.test.ts` |
| Token resolver: `git symbolic-ref refs/remotes/origin/HEAD` → branch; default `main` | Unit | `.agents/scripts/bkit-tokens.test.ts` |
| Token resolver: `package.json.name` → required; absent → error | Unit | `.agents/scripts/bkit-tokens.test.ts` |
| Token substitution applied once per install at write-time (not template-read time) | Unit | `.agents/scripts/bkit-tokens.test.ts` |
| Hash-comment marker variant (`# bkit:start`/`# bkit:end`) round-trips for YAML/INI/shell | Unit | `.agents/scripts/bkit-install.test.ts` (extend) |
| HTML-comment marker round-trip + default-arg backward-compat (markdown / `.gitignore`) | Unit | `.agents/scripts/bkit-install.test.ts` (extend) |
| Tier 1 fully-managed write: `.cursor/hooks.json` always rewritten verbatim | Unit | `.agents/scripts/bkit-tiers.test.ts` |
| Tier 2 managed-block: existing `ci.yml` with consumer jobs → block appended at EOF; consumer preserved | Unit | `.agents/scripts/bkit-tiers.test.ts` |
| Tier 3 seed-or-print: `slop-scan.config.json` exists → no write; suggested-diff printed to stdout | Unit | `.agents/scripts/bkit-tiers.test.ts` |
| Dry-run parity: `check --full` writeset ≡ `install --full` writeset (regression of 14-vs-15 bug) | Integration | `.agents/scripts/bkit-dry-run-parity.integration.test.ts` |
| Cross-module dry-run parity (per-module `check ≡ install`) | Integration | `.agents/scripts/bkit-dry-run-parity.integration.test.ts` |
| Token-substituted `ci.yml` template renders auth-shim step inside bkit block | Unit | `.agents/scripts/bkit-install.test.ts` (extend) |
| Substituted `ci.yml` end-to-end: `node-version: 22`, `branches: [main]`, pnpm major `10` on disk | Integration | `.agents/scripts/bkit-modules.integration.test.ts` |

### 👤 ✅ Human Confirmation

- [x] **Acceptance Scenario confirmed.**

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until checked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

### Breaking Changes (v4-2)

- **`findLineAnchoredMarkers` / `extractManagedBlock` / `extractFullManagedBlock` / `updateManagedBlock` signature change** — adds optional `markerStyle: "html-comment" | "hash-comment"` arg with default `"html-comment"`. Backward-compat preserved — existing call sites that omit the arg get the existing HTML-comment behaviour byte-identically. **No consumer scripts break.**
- New marker variant `# bkit:start` / `# bkit:end` introduced for YAML / INI / shell formats. Existing `<!-- bkit:start -->` / `<!-- bkit:end -->` retained for markdown / `.gitignore`.

### New Naming (v4-2)

- New script files: `.agents/scripts/bkit-tokens.ts`, `.agents/scripts/bkit-tiers.ts` (split from `bkit-install.ts` to keep each module under ~300 LOC).
- New test files: `bkit-tokens.test.ts`, `bkit-tiers.test.ts`, `bkit-dry-run-parity.integration.test.ts`. Stub `bkit-cli.test.ts`, `bkit-modules.integration.test.ts` are also created in Phase 0 (filled by v4-3).
- Marker variants: `markerStyle: "html-comment"` (default, existing) and `"hash-comment"` (new).
- New template paths under `.agents/templates/`: `.github/workflows/ci.yml`, `.vale.ini`, `.vale/styles/House/**`, `slop-scan.config.json`, `.prettierignore`, `.husky/pre-commit`, `.husky/pre-push`, `.cursor/hooks.json`, `.cursor/settings.json`.

### DB / API / Routes

None — bkit is a CLI tool.

### 👤 ✅ Human Confirmation

- [x] **Breaking Changes confirmed.**

---

## Alternative Approaches & Recommendations

**Rejected (per master plan-input.md disambiguations):**

- 3-way merge / versioned migrations — overkill for v0.1.2; tier-based ownership solves 95% of cases at ~10% of complexity.
- `package.json` JSON-merging — print-only this round, revisit in v0.2.
- Prompted token-detection fallback — non-interactive only in v0.1.2; revisit if "all defaults fail" cases prove painful.

**Reviewer 2 C1 caveat (carried verbatim from master):** The v1 plan attributed the 14-vs-15 mismatch to `runTemplates` rule 3a, but reading actual source (`.agents/scripts/bkit-install.ts` lines 425–443) shows rule 3a **already increments `writes++`** before the `continue`. The real divergence is elsewhere — likely a `.gitignore` append-block path NOT covered by `runTemplates` (possibly `runHost` or a path that bypassed the templates pass). Phase 5 Task 5.1 must investigate before specifying the fix in Task 5.2. Do not pre-assume the fix location.

## Out of Scope (v4-2)

- Module-flag CLI surface (`bkit-cli.ts`) — v4-3 Phase 3.
- Module dispatcher (`bkit-modules.ts`) and `bkit-install.ts` `main()` refactor — v4-3 Phase 4.
- Deletion of `bkit-init.ts` — v4-3 Task 4.4.
- README + `.agents/README.md` rewrites — v4-3 Tasks 8.1, 8.2.
- `docs/decisions.md` / `docs/pending.md` appends — v4-3 Tasks 9.1, 9.2.
- Version bump to `0.1.2` — v4-3 Task 10.1.
- Manual smoke gates (Gate 4.5a, 4.5b) — v4-3.

Master-level out-of-scope items also apply: `postflight.sh`, `package.json` automated merging, husky auto-install, reusable-workflow distribution, helper auth action, `--no-X` / `--force` flags, `{{VERCEL_PROJECT_ID}}` / `{{LINEAR_TEAM_ID}}` token substitution, `claude.yml` / `ci-complete.yml` / `smoke.yml`, new CI workflows beyond `ci.yml`.

## Merge Method

**Squash.** `feat/bar-130-ci-lint-scaffolding` → `dev`.

## Supersession Inventory

None within v4-2's scope. (All six master supersession rows touch CLI surfaces owned by v4-3 — see `bar-130-ci-lint-scaffolding-plan.md` Cross-cutting: Supersession Inventory Distribution.)

## Security & Privacy

- [x] **New secret/env var (consumer-side, not bkit-side):** `BKIT_READ_TOKEN` is referenced inside the `ci.yml` template authored in Task 6.1. The README documentation block lives in v4-3 Task 8.1. v4-2's responsibility is to ensure the template literally contains the auth-shim line (verified by Task 6.1's automated assertion).
- [x] **User input** — no new flags parsed in v4-2 (CLI parsing lives in v4-3). Token detection in `bkit-tokens.ts` reads project state; no user-provided file paths.
- [x] **PII** — none. Logs print file paths and write counts only; tokens resolved are version strings + branch names.

_All other rows: N/A — no DB, no routes, no auth, no webhook, no notifications._

## 🚨 Pre-Flight / Dependencies 🚨

### Core (always verify)

- [ ] **Package Management:** `package.json` v0.1.1 (DO NOT bump — v4-3 owns Task 10.1). `prettier` devDep + lint scripts already added by v4-1.
- [ ] **Dependency Versions:** Verify `pnpm --version` (≥ 10), `node --version` (≥ 20), `tsc --version` (≥ 5.4).
- [ ] **User Context:** Verify read/write on `.agents/scripts/`, `.agents/templates/` (creating subtrees), `bkit-install.ts`, `bkit-install.test.ts`.
- [ ] **Pending Blockers:** Query Linear for open issues with `blocker` label.
- [ ] **Project Context:** No prior `docs/knowledge.md` / `docs/decisions.md` entries gate this work (the BAR-130 ADRs are appended in v4-3 Task 9.1).
- [ ] **Testing & Quality:** Vitest configured; tests co-located as `*.test.ts` (unit) and `*.integration.test.ts` (integration). Mocking strategy: real fs against `os.tmpdir()` + `process.chdir` (existing pattern in `bkit-install.test.ts`).
- [ ] **Prerequisite Plans:** **v4-1 must be merged** (or its scripts/devDep at least staged on the same branch) so `pnpm format:check` / `pnpm lint:prose` / `pnpm lint:slop` work for v4-2's pre-PR gates.

### Conditional

- [ ] **Architecture & UI:** N/A — CLI tool only.
- [ ] **Observability:** Bkit logs to stdout/stderr with `[bkit-install]` / `[bkit-check]` prefix; existing convention preserved.

### 🔒 Gate 1: Prerequisites Check

- [x] **Acceptance Scenario confirmed.**
- [x] **Breaking Changes confirmed.**
- [ ] **Gate 1 - Verified:** All Core checked; applicable Conditional checked; v4-1 prerequisite confirmed.

## Data Schema Integration

None.

## Architecture & Component Changes

### Database Migrations

None.

### B. bkit-the-installer (three-tier write logic + tokens)

#### [NEW] `.agents/scripts/bkit-tokens.ts`

- Exports `resolveTokens(cwd: string): TokenMap` — reads `.nvmrc`, `package.json.engines.node`, `package.json.packageManager`, `package.json.name`, `git symbolic-ref refs/remotes/origin/HEAD`. Returns `{ NODE_VERSION, PNPM_VERSION, DEFAULT_BRANCH, PROJECT_NAME }` with documented fallbacks. Hard-fails on missing `package.json.name`.
- Exports `applyTokens(content: string, tokens: TokenMap): string` — substitutes `{{TOKEN}}` placeholders. Substitution happens at write-time, not read-time (per master disambiguation 7).

#### [NEW] `.agents/scripts/bkit-tiers.ts`

- Exports three writers: `writeTier1(srcPath, destPath, tokens, dryRun)`, `writeTier2(srcPath, destPath, tokens, markerStyle, dryRun)`, `writeTier3(srcPath, destPath, dryRun, printSink)`.
- `markerStyle`: `"html-comment"` (markdown / `.gitignore`) or `"hash-comment"` (YAML / INI / shell). Markers re-use `findLineAnchoredMarkers` parser already in `bkit-install.ts`.
- Tier 1: idempotent rewrite of whole file (after token substitution).
- Tier 2: extend existing managed-block logic — generalised to take a `markerStyle` arg; format-specific marker emission.
- Tier 3: write-if-absent; if present, push suggested-diff to `printSink` and return `{ wrote: false, suggested: true }`.

#### [MODIFY] `.agents/scripts/bkit-install.ts` (marker generalisation + dry-run parity fix only — `main()` refactor is v4-3)

- **Existence Check:** `.agents/scripts/bkit-install.ts` exists.
- Generalise `findLineAnchoredMarkers`, `extractManagedBlock`, `extractFullManagedBlock`, `updateManagedBlock` to accept an optional `markerStyle` arg (default `"html-comment"` for backward compat).
- Fix dry-run parity bug (BAR-131 #3) at the actual root cause identified in Task 5.1 sub-step a. Introduce a shared `WriteSet` accumulator that both `check` and `install` populate identically (so future divergence is impossible by construction).
- **Note:** `main()` refactor (parseArgs/dispatch through MODULE_REGISTRY/etc.) lives in v4-3 Task 4.3. v4-2 only adds `markerStyle` arg + `WriteSet` accumulator; `main()` still uses the old verb+host shape until v4-3 swaps it.

#### [NEW] `.agents/templates/.github/workflows/ci.yml`

- Tier 2 template — contains ONLY the bkit-managed block with hash-comment markers. Includes:
  - `# bkit:start` line.
  - `bkit-gates` job: setup-node `{{NODE_VERSION}}`, pnpm `{{PNPM_VERSION}}`, auth-shim step (`git config --global url."https://x-access-token:${{ secrets.BKIT_READ_TOKEN }}@github.com/".insteadOf "https://github.com/"`), `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm test`, `pnpm format:check`, `pnpm lint:prose`, `pnpm lint:slop`, `bkit check`.
  - `on: pull_request: branches: [{{DEFAULT_BRANCH}}]`.
  - `# bkit:end` line.
- Substitution at write-time per `bkit-tokens.applyTokens`.

#### [NEW] `.agents/templates/.vale.ini`

- Tier 2 with hash-comment markers. Scopes `.agents/**` + root `*.md`.

#### [NEW] `.agents/templates/.vale/styles/House/`

- Tier 1 fully-managed payload (multiple files, mirror of seed).

#### [NEW] `.agents/templates/slop-scan.config.json`

- Tier 3 — verbatim seed config.

#### [NEW] `.agents/templates/.prettierignore`

- Tier 2 hash-comment markers.

#### [NEW] `.agents/templates/.husky/pre-commit` and `.agents/templates/.husky/pre-push`

- Tier 2 hash-comment markers; bkit-managed block runs `pnpm lint:prose && pnpm lint:slop` (pre-commit) and `pnpm typecheck && pnpm test` (pre-push).

#### [NEW] `.agents/templates/.cursor/hooks.json`

- Tier 1 fully-managed JSON. Wires `sessionStart`/`stop` hooks per seed.

#### [NEW] `.agents/templates/.cursor/settings.json`

- Tier 3 seed-or-print (JSON, no comments).

#### [NEW or VERIFY] `.agents/templates/.claude/hooks/preflight.sh`

- Tier 1 — already partially exists; verify and conform to seed.

### Cron Jobs & Scheduled Tasks

None.

## Documentation Updates

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `docs/knowledge.md` | Append if dry-run-parity root cause investigation surfaces a non-trivial gotcha (Phase 5 Task 5.1 sub-step a). |

_All other doc rows: untouched in v4-2 — see v4-3 for README + `.agents/README.md` rewrites and `docs/decisions.md` / `docs/pending.md` appends._

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **Code** | `git revert {squash-commit}` on `dev`. | Code-only — no DB. v4-2 adds new modules + templates and modifies `bkit-install.ts` (marker-arg + `WriteSet`). Revert restores v0.1.1 byte-identical signatures via the default-arg backward-compat. |

## Agent Execution Runbook

> [!IMPORTANT]
> Continuous execution. Each task: scope → acceptance → verification. Reproduce-first: failing test before code. Step Isolation: complete each task fully (incl. test pass + box check) before next.

### Phase 0 — Branch + scaffolding

- [ ] **Task 0.1 — Branch:** From worktree root, confirm branch is `feat/bar-130-ci-lint-scaffolding` (matches FID). `git status` clean except this plan.
  - **Verification:** `git rev-parse --abbrev-ref HEAD` outputs `feat/bar-130-ci-lint-scaffolding`.

- [ ] **Task 0.2 — Scaffold empty test files (Reproduce-first stubs):** Create `bkit-tokens.test.ts`, `bkit-tiers.test.ts`, `bkit-cli.test.ts`, `bkit-modules.integration.test.ts`, `bkit-dry-run-parity.integration.test.ts` in `.agents/scripts/`. Each with one `it.todo("…")` per Derived Test Matrix row targeting that file. **Note:** v4-2 creates ALL five stub files (including `bkit-cli.test.ts` and `bkit-modules.integration.test.ts` which v4-3 fills). v4-2's own tasks fill `bkit-tokens.test.ts`, `bkit-tiers.test.ts`, `bkit-dry-run-parity.integration.test.ts` plus the substituted-`ci.yml` row in `bkit-modules.integration.test.ts` (Task 6.1b).
  - **Verification:** `pnpm test` runs and reports the new `todo`s; no green-painting.

### Phase 1 — Token resolver (B-1)

- [ ] **Task 1.1 — Failing tests for token resolver:** In `bkit-tokens.test.ts`, write tests for: (a) `.nvmrc` major extraction, (b) `package.json.engines.node` parse-min fallback, (c) `package.json.packageManager` major extraction, (d) `git symbolic-ref` branch parsing, (e) `package.json.name` required (hard-fail), (f) all defaults when sources absent. Use `tmpdir` + `process.chdir`.
  - **Verification:** `pnpm test bkit-tokens` shows red (`resolveTokens` not implemented).

- [ ] **Task 1.2 — Implement `bkit-tokens.ts`:** Create `.agents/scripts/bkit-tokens.ts` with `resolveTokens(cwd)` and `applyTokens(content, tokens)`. Follow source priority + default tables from BAR-130 disambiguation 7.
  - **Acceptance:** All Task 1.1 tests pass.
  - **Verification:** `pnpm test bkit-tokens` green; `pnpm typecheck` green.

- [ ] **Task 1.3 — Substitution timing test:** Add test asserting `applyTokens` runs once per file at write-time (not at template-read time) — mock `fs.writeFileSync` and assert the written content has resolved tokens, while `.agents/templates/` source still has `{{TOKEN}}` placeholders.
  - **Verification:** Test green.

### Phase 2 — Marker generalisation + tier writers (B-2)

- [ ] **Task 2.1a — Failing tests for hash-comment marker round-trip (Auditor 1 CRITICAL #1):** Extend `bkit-install.test.ts` with cases asserting `findLineAnchoredMarkers` recognises hash-comment marker literal `# bkit:start` / `# bkit:end` and round-trips on YAML/INI/shell content. **Concrete marker string literals (Reviewer 2 C6):**
  - `markerStyle: "hash-comment"` → `START = "# bkit:start"`, `END = "# bkit:end"` (NEW — line-anchored, no surrounding whitespace required for match).
  - **Acceptance:** test asserts `extractManagedBlock` + `updateManagedBlock` round-trip with `markerStyle: "hash-comment"` byte-identically on (i) YAML, (ii) INI, (iii) shell content. Three distinct fixture cases.
  - **Verification:** New hash-comment tests red; existing html-comment tests still green.

- [ ] **Task 2.1b — Failing tests for html-comment round-trip + default-arg backward-compat:** Extend `bkit-install.test.ts` with cases asserting:
  - `markerStyle: "html-comment"` → `START = "<!-- bkit:start -->"`, `END = "<!-- bkit:end -->"` (existing constants — preserve).
  - **Acceptance:** test asserts (a) html-marker round-trip on markdown content, (b) html-marker round-trip on `.gitignore` content, (c) calling existing API without `markerStyle` arg defaults to `"html-comment"` and produces byte-identical output to v0.1.1 (backward-compat regression).
  - **Verification:** New default-arg backward-compat test red; existing html-comment regression tests still green.

- [ ] **Task 2.2 — Generalise marker parser + update all call sites:** Modify the four exported functions in `.agents/scripts/bkit-install.ts` to take an optional `markerStyle: "html-comment" | "hash-comment"` arg (default `"html-comment"` for backward compat — Reviewer 2 C2). The four functions and their internal couplings:
  - `findLineAnchoredMarkers(content, markerStyle?)` — switches on `markerStyle` to select between `(START_MARKER, END_MARKER)` html-pair and `(HASH_START_MARKER, HASH_END_MARKER)` hash-pair.
  - `extractManagedBlock(content, markerStyle?)` — passes `markerStyle` through to `findLineAnchoredMarkers`.
  - `extractFullManagedBlock(content, markerStyle?)` — **also calls `findLineAnchoredMarkers` internally** (currently uses hardcoded `START_MARKER` / `END_MARKER`); update internal call to forward `markerStyle`.
  - `updateManagedBlock(filePath, newContent, dryRun, markerStyle?)` — adds 4th arg; emits the matching marker pair on write.
  - **Call-site audit (must update or confirm safe-default):** all references to these four functions in `bkit-install.ts` (current `main()` / `runTemplates` / `runHost`), in `bkit-install.test.ts`, and in any new module file (`bkit-tiers.ts` from this child; `bkit-modules.ts` from v4-3). Run `grep -nE 'findLineAnchoredMarkers|updateManagedBlock|extractManagedBlock|extractFullManagedBlock' .agents/` and update every site that needs hash-comment behaviour; sites that omit the arg get the html-comment default unchanged.
  - **Acceptance:** Tasks 2.1a + 2.1b tests pass; original tests still green; backward-compat regression test (default arg behaviour) green.
  - **Verification:** `pnpm test bkit-install` green; `pnpm typecheck` green; `grep` audit produces zero unexplained mismatches.

- [ ] **Task 2.3 — Failing tests for tier writers:** In `bkit-tiers.test.ts`, write tests for Tier 1 (idempotent rewrite), Tier 2 (managed-block append on existing file with consumer content above), Tier 3 (write-if-absent + suggested-diff to printSink). Cover hash-comment AND html-comment marker styles per tier.
  - **Verification:** Tests red.

- [ ] **Task 2.4 — Implement `bkit-tiers.ts`:** Create `.agents/scripts/bkit-tiers.ts` with `writeTier1`, `writeTier2`, `writeTier3`. Reuse `runTemplates` rule logic where possible; factor out from `bkit-install.ts`.
  - **Acceptance:** Task 2.3 tests pass.
  - **Verification:** `pnpm test bkit-tiers` green.

### Phase 5 — Dry-run parity (B-3 absorption from BAR-131 #3)

> [!WARNING]
> **Reviewer 2 C1 — root cause not yet pinned.** The v1 plan attributed the 14-vs-15 mismatch to `runTemplates` rule 3a, but reading actual source (`.agents/scripts/bkit-install.ts` lines 425–443) shows rule 3a **already increments `writes++`** before the `continue`. The real divergence is elsewhere — likely a `.gitignore` append-block path NOT covered by `runTemplates` (possibly `runHost` or a path that bypassed the templates pass). **Task 5.1 must investigate before specifying the fix in Task 5.2.** Do not pre-assume the fix location.

- [ ] **Task 5.1 — Reproduce 14-vs-15 bug as failing test + ROOT-CAUSE INVESTIGATION:**
  - **Sub-step a — investigate (Reviewer 2 C1):** Set up a real tmpdir mirroring `app-gether-life`'s state pre-v0.1.2 install (snapshot relevant files; document in test fixtures). Run `bkit check --full` and `bkit install --full` against the tmpdir back-to-back. Diff the two writesets manually. Identify the exact path that diverges (file + which code path produced the live write but missed the dry-run prediction). Document the root cause inline as a comment in the test.
  - **Sub-step b — failing test:** In `bkit-dry-run-parity.integration.test.ts`, codify the reproduction: setup tmpdir, run `bkit check --full`, run `bkit install --full`, capture the writeset (file path + content) for each via the shared `WriteSet` accumulator (introduced in this phase), assert equality. Test fails showing the diverging path identified in sub-step a.
  - **Verification:** Test red, exposing the bug; comment in test names the diverging code path (NOT pre-assumed to be `runTemplates`).

- [ ] **Task 5.2 — Fix dry-run divergence at the actual root cause:** Apply the fix at the location identified by Task 5.1 sub-step a — could be `runTemplates`, `runHost`, payload-copy pass, or a tier writer's dry-run branch. Introduce/extend a shared `WriteSet` accumulator that both `check` and `install` populate identically (so future divergence is impossible by construction). Audit all passes for the same gap.
  - **Acceptance:** Task 5.1 test passes.
  - **Verification:** Test green; manual repro from Task 5.1 sub-step a now shows `check` writeset ≡ `install` writeset.

- [ ] **Task 5.3 — Cross-module parity:** Add parity tests for each module in isolation (`check --ci` ≡ `install --ci`, `check --claude` ≡ `install --claude`, `check --lint` ≡ `install --lint`, `check --git-hooks` ≡ `install --git-hooks`, `check --core` ≡ `install --core`).
  - **Note:** these tests can be authored against the (still-existing) old verb+host CLI and the modules-via-direct-call-from-test-side until v4-3 Phase 4 wires the dispatcher; alternatively, mark these `it.todo` and promote in v4-3 alongside dispatcher completion. Task acceptance is satisfied either way; recommended approach is to author the tests now using direct module-fn calls (the module fns themselves do not yet exist in v4-2 — they live in v4-3 Phase 4 — so `it.todo` is the realistic path here, with promotion required by v4-3's Phase 0 audit).
  - **Verification:** All green at end of v4-3 Phase 4.

### Phase 6 — Templates payload (B + A)

- [ ] **Task 6.1 — Add `.agents/templates/.github/workflows/ci.yml` (Tier 2):** Bkit-managed block only, with `# bkit:start` / `# bkit:end` markers. Job `bkit-gates`: setup-node `{{NODE_VERSION}}`, pnpm `{{PNPM_VERSION}}`, auth-shim, `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm test`, `pnpm format:check`, `pnpm lint:prose`, `pnpm lint:slop`, `bkit check`. `on: pull_request: branches: [{{DEFAULT_BRANCH}}]`.
  - **Acceptance (Auditor 1 CRITICAL #2 — DoD bullet 12 auth-shim assertion):** Add an automated test in `bkit-install.test.ts` (matrix row "Token-substituted `ci.yml` template renders auth-shim step inside bkit block") that loads the rendered template after `applyTokens` and asserts the auth-shim line `git config --global url."https://x-access-token:${{ secrets.BKIT_READ_TOKEN }}@github.com/"` appears LITERALLY between the `# bkit:start` and `# bkit:end` markers (extract managed block, then `expect(block).toContain('BKIT_READ_TOKEN')` AND `expect(block).toContain('git config --global url.')`). Test must also assert the auth-shim step appears BEFORE the `pnpm install --frozen-lockfile` step (line index of shim < line index of install).
  - **Verification:** Run `bkit install --ci` against tmpdir with existing `ci.yml` containing 2 consumer jobs → bkit block appended; consumer jobs preserved; `pnpm test bkit-install` green including the new auth-shim-inside-block assertion. **Note:** `bkit install --ci` here is exercised via a direct test harness invoking the to-be-written tier writer + token apply (not the full CLI dispatch which lives in v4-3); the consumer-jobs-preserved assertion is a unit-level test of `writeTier2` against a fixture.

- [ ] **Task 6.1b — Integration test: substituted `ci.yml` end-to-end (Auditor 1 CRITICAL #3 — DoD bullet 9):** In `bkit-modules.integration.test.ts` add a test that asserts the integrated path (`resolveTokens` → `applyTokens` → Tier 2 write → final on-disk `ci.yml` content) substitutes Node/pnpm/branch values:
  - **Setup:** tmpdir pre-seeded with `.nvmrc: 22\n`, `package.json` `{"name":"x","packageManager":"pnpm@10.4.1"}`, `git init` with default branch `main`.
  - **Acceptance:** after `runCiModule` (or `runFull`) executes, `fs.readFileSync(".github/workflows/ci.yml","utf8")` contains literal substrings: `node-version: 22`, `branches: [main]`, and the pnpm major version `10` (e.g., `version: 10` in pnpm/action-setup step). No `{{NODE_VERSION}}` / `{{PNPM_VERSION}}` / `{{DEFAULT_BRANCH}}` placeholders remain in the on-disk file.
  - **Note:** `runCiModule` does not exist until v4-3 Phase 4. v4-2 implements this test by directly invoking `resolveTokens` + `applyTokens` + `writeTier2` against the tmpdir (the same byte-equivalent path the dispatcher will eventually take). v4-3 may refactor the test to call `runCiModule` once it exists; the assertions remain identical.
  - **Verification:** `pnpm test bkit-modules` green; integration assertion fails if any token substitution path regresses.

- [ ] **Task 6.2 — Add `.agents/templates/.vale.ini` (Tier 2 hash-comment) + `.agents/templates/.vale/styles/House/**` (Tier 1):** Slim seed to `.agents/**` + root `*.md` scopes only.
  - **Verification:** Direct-write test asserts both write paths produce expected content; rerun = no-op. Full `bkit install --lint` round-trip lives in v4-3 Phase 4.

- [ ] **Task 6.3 — Add `.agents/templates/slop-scan.config.json` (Tier 3):** Verbatim from seed.
  - **Verification:** Tier 3 unit test (Task 2.3) covers the existing-consumer-file → suggested-diff path; absent → file written.

- [ ] **Task 6.4 — Add `.agents/templates/.prettierignore` (Tier 2 hash-comment):** Standard ignore list.
  - **Verification:** Tier 2 unit test (Task 2.3) covers append-block on existing file; whole file write on greenfield.

- [ ] **Task 6.5 — Add `.agents/templates/.husky/pre-commit` + `pre-push` (Tier 2 hash-comment):** `pre-commit` runs `pnpm lint:prose && pnpm lint:slop`; `pre-push` runs `pnpm typecheck && pnpm test`. Set executable bit.
  - **Verification:** Direct-write test asserts files written with `0o755` mode.

- [ ] **Task 6.6 — Add `.agents/templates/.cursor/hooks.json` (Tier 1) + `.cursor/settings.json` (Tier 3):** Mirror seed wiring (sessionStart/stop hooks; plugin allowlist).
  - **Verification:** Tier 1 / Tier 3 unit tests (Task 2.3) cover the round-trip semantics; the `.cursor/` payload is exercised end-to-end by v4-3 Phase 4 module dispatch tests.

### 🔒 Gate 2: Code Implementation Check

- [ ] **Gate 2 - Verified:** Every task above (Phases 0, 1, 2, 5, 6 — 20 tasks) checked off and independently verified.

> [!IMPORTANT]
> **Testing Strategy:** Vitest unit (`*.test.ts`) and integration (`*.integration.test.ts`) co-located with source under `.agents/scripts/`. No Playwright (no UI). No DB integration tests. Mocking strategy: real fs against `os.tmpdir()` + `process.chdir` (existing pattern in `bkit-install.test.ts`); no fs mocks except where explicitly testing dry-run write-set tracking.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Cross-check every v4-2 Test Matrix row against a runbook task — all 14 rows mapped.
- [ ] **Update existing tests:** Existing `bkit-install.test.ts` tests updated for marker-style generalisation (Task 2.2). All other existing tests remain unchanged.
- [ ] **Write new tests:** Three new test files filled in v4-2 (`bkit-tokens.test.ts`, `bkit-tiers.test.ts`, `bkit-dry-run-parity.integration.test.ts`) plus extensions to `bkit-install.test.ts` and one row in `bkit-modules.integration.test.ts` (Task 6.1b).
- [ ] **Verify observability:** `[bkit-install]` / `[bkit-check]` log prefix preserved across new modules. No PII; no log drains.
- [ ] **Update documentation:** `docs/knowledge.md` if Task 5.1 surfaces a non-trivial gotcha (otherwise no doc updates in v4-2).

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** `docs/knowledge.md` updated if applicable (else N/A).
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

## Verification Plan

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm typecheck` (`tsc --noEmit`) green; `pnpm format:check` green.
- [ ] **Unit + Integration:** `pnpm test` runs all `*.test.ts` + `*.integration.test.ts`. v4-2 contributes ~22 new tests (Token resolver ~6, Tiers ~6, marker hash/html splits ~3, dry-run parity ~7, plus the auth-shim assertion in `bkit-install.test.ts` and the substituted-`ci.yml` integration test).
- [ ] **Build:** `pnpm build` (`tsc`) emits `dist/bkit-install.js`, `dist/bkit-tokens.js`, `dist/bkit-tiers.js`. (`dist/bkit-init.js` still exists at end of v4-2 — its deletion is v4-3 Task 4.4.)
- [ ] **Self-test:** `pnpm tsx .agents/scripts/bkit-install.ts check` exits 0 against bkit-the-repo (which now has the dogfood markers added by v4-1).
- [ ] **CI on PR:** `.github/workflows/ci.yml` (added by v4-1) runs all gates green on the PR for this branch.

### 🔒 Gate 4: Automated Verification Confirmed

- [ ] **Gate 4 - Verified:** Every Automated Tests checkbox checked. CI run output captured.

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** Use `gh run list --branch feat/bar-130-ci-lint-scaffolding`, `gh run view --log-failed`, etc. — no GitHub UI checks.

- [ ] **Step 1 — Token resolution against tmpdir:** Pre-seed tmpdir with `.nvmrc: 22\n`, `package.json {"name": "x", "packageManager": "pnpm@10.4.1"}`, `git init` with default branch `main`. Invoke `resolveTokens(tmpdir)` → expect `{ NODE_VERSION: "22", PNPM_VERSION: "10", DEFAULT_BRANCH: "main", PROJECT_NAME: "x" }`.
- [ ] **Step 2 — Marker round-trip:** Invoke `extractManagedBlock` + `updateManagedBlock` with `markerStyle: "hash-comment"` against a YAML fixture; assert byte-identical round-trip. Repeat with `"html-comment"` and an INI fixture for default-arg backward-compat.
- [ ] **Step 3 — Auth-shim inside `ci.yml` template:** Open `.agents/templates/.github/workflows/ci.yml`, run `applyTokens` against fixture tokens, assert the auth-shim line appears literally between `# bkit:start` / `# bkit:end` and BEFORE `pnpm install --frozen-lockfile`.
- [ ] **Step 4 — Dry-run parity:** Reproduce the `app-gether-life`-derived fixture from Task 5.1 sub-step a; run `bkit check --full` then `bkit install --full`; compare writesets line-by-line on identical starting state.

> v4-2 has NO Gate 4.5 (manual smoke is owned by v4-3 only).
