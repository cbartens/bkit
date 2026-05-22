# BAR-130 v4-3 — CLI Redesign + Ship Prep (Scope C) Implementation Plan

**Parent Plan:** [`plan-v4-split.md`](./plan-v4-split.md)
**Master full plan (v3 — checked):** [`plan-v3-checked.md`](./plan-v3-checked.md)
**Sibling order:** v4-1 → v4-2 → v4-3 (this).
**Prerequisites:** v4-1 (lint scripts + bkit's CI) AND v4-2 (token resolver, tier writers, templates, dry-run parity, marker generalisation) MUST complete first.

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this `plan-v4-3.md` natively via `Read` _before_ executing any steps.
> 2. NEVER trust system summaries or prior conversation to determine what is done.
> 3. Source of truth: literal `[x]` vs `[ ]` checkboxes below.

## Context & Goals

This child closes the BAR-130 ship by replacing bkit's fragmented CLI surface (`init` + `install` + `--host=`) with a single `install` verb taking composable module flags (`--core`, `--claude`, `--cursor`, `--ci`, `--lint`, `--git-hooks`, `--full`); refactoring `bkit-install.ts` `main()` to dispatch through a module registry; deleting `bkit-init.ts`; rewriting `README.md` + `.agents/README.md` for the new surface; appending the BAR-130 ADRs and v0.2 kill-date entries; bumping `package.json` to `0.1.2`; and gating the manual smoke against `app-gether-life` + a second consumer.

**Success Criteria (this child):**

- `bkit install` (no flags) on empty repo seeds full stack across all three tiers (DoD bullet 2).
- `bkit install --claude` on empty repo seeds only `.claude/**` + core (DoD bullet 3).
- `bkit install --ci --lint` seeds CI + lint stack + core; nothing else (DoD bullet 4).
- `bkit install` second run = zero diff (DoD bullet 7).
- `bkit init` and `bkit install --host=claude` print deprecation warns and run the new equivalents (DoD bullets 10, 11).
- `app-gether-life` re-installs at v0.1.2 with no surprise drift; CI green on first run (DoD bullet 13 — Gate 4.5a).
- Second consumer (e.g. `www-visitfrasercoast-com`) onboards via `bkit install --full`; CI green (DoD bullet 14 — Gate 4.5b).
- `package.json` bumped to `0.1.2`; tag-push handed off to `bkit-ship` (DoD bullet 15).
- `README.md` + `.agents/README.md` document three-tier model, module-flag CLI, `init` deprecation (DoD bullet 16).

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**

### Narrative _(inherited from master)_

A consumer adds `@cbartens/bkit@v0.1.2` to their repo, runs `bkit install --full` once on a non-empty project, and gets a complete, idempotent agent + CI + lint + git-hooks stack — bkit-managed blocks injected without clobbering existing files, tokens (`{{NODE_VERSION}}`, `{{PNPM_VERSION}}`, `{{DEFAULT_BRANCH}}`, `{{PROJECT_NAME}}`) substituted from project state, dry-run/install parity preserved, and the private-repo CI auth-shim seeded so first PR CI passes.

### Success Criteria _(inherited from master, full set; this child closes #1, #2, #5 and contributes to #3, #4)_

1. **`bkit install` (no flags ≡ `--full`) on empty repo seeds files across all three tiers; `git diff` shows expected additions only.** ← THIS CHILD (closes via dispatcher).
2. **Selective module install (`bkit install --claude`, `bkit install --ci --lint`) seeds only the requested modules + `--core`; other dirs untouched.** ← THIS CHILD.
3. `bkit install --ci` on existing customised `ci.yml` injects bkit-managed block (engine work in v4-2; end-to-end CLI exercise here).
4. `bkit check --full` writeset equals `bkit install --full` writeset (parity engine in v4-2; end-to-end CLI exercise here).
5. **`bkit init` and `bkit install --host=claude` print deprecation warn and run the new equivalent.** ← THIS CHILD.

### Concrete Example _(v4-3 specialisation — full user-facing flow)_

**Setup:** Maintainer of `www-visitfrasercoast-com` (existing pnpm 10 monorepo, Node 22, `main` default branch, has `.gitignore` + `.github/workflows/ci.yml` with 2 custom jobs, no `.cursor/`/`.claude/`/`.vale*`/`.husky/`).

**Steps:**

1. User runs `pnpm add -D github:cbartens/bkit#v0.1.2` → pnpm clones, builds `dist/`.
2. User runs `pnpm exec bkit install --full` → console prints managed writes per file; tokens resolved (`node-version: 22`, `pnpm/action-setup` major `10`, `branches: [main]`); `.github/workflows/ci.yml` gains `bkit-gates` job inside `# bkit:start ... # bkit:end` markers; `.gitignore` gains bkit block; `.vale.ini` / `.vale/styles/House/**` / `slop-scan.config.json` / `.prettierignore` written; `.husky/pre-commit` and `.husky/pre-push` seeded; `.bkit-version` = `0.1.2` written; print-only block at end of run lists `package.json` script entries to add.
3. User adds the printed `package.json` entries + `pnpm.onlyBuiltDependencies: ["@cbartens/bkit"]` allowlist + sets `BKIT_READ_TOKEN` GitHub Actions secret per README.
4. User runs `pnpm exec bkit check --full` → exits 0 (no drift).
5. User pushes PR → CI uses auth-shim, `pnpm install` succeeds, all gates pass.

**Outcome:** Repo has full bkit stack; consumer's pre-existing CI jobs preserved; second `bkit install --full` is a no-op.

### Edge Cases _(filtered from master to v4-3's surface)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| `--full` invoked with `--ci` (redundant) | Both resolve to all modules; no double-write per module (idempotent module dispatch) |
| Consumer previously installed via `bkit init --host=cursor` | `bkit init` prints deprecation, runs `install --full`; consumer's `.cursor/` updated, `.claude/` newly seeded |
| `bkit check --ci` on repo where `ci.yml` block content is stale | Exits non-zero; `bkit install --ci` writes the new block; second `bkit check --ci` exits 0 |
| Mid-install crash between Tier 1 rewrite of `.cursor/hooks.json` and Tier 2 update of `ci.yml` | Plan accepts non-atomicity for v0.1.2 (rerun fixes); `--core` `.bkit-version` write moved to LAST step so partial = still detectable as upgrade-needed |

### Derived Test Matrix _(v4-3 subset)_

> v4-3 owns 7 of the master's 21 Test Matrix rows.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Module dispatch: `--claude` writes only `.claude/**` + core; no `.cursor/`/`.github/`/`.vale*` | Integration | `.agents/scripts/bkit-modules.integration.test.ts` |
| Module dispatch: `--ci --lint` writes core + CI + lint stack; no Cursor/Claude/Husky | Integration | `.agents/scripts/bkit-modules.integration.test.ts` |
| `--full` ≡ no flags (writeset equality) | Integration | `.agents/scripts/bkit-modules.integration.test.ts` |
| `--core` is implicit before any other module (auto-prepend) | Integration | `.agents/scripts/bkit-modules.integration.test.ts` |
| Idempotence: `install --full` then `install --full` → second run zero writes/zero deletes | Integration | `.agents/scripts/bkit-modules.integration.test.ts` |
| `bkit init` deprecation: prints warn + delegates to `install --full` | Unit | `.agents/scripts/bkit-cli.test.ts` |
| `bkit install --host=claude` deprecation: prints warn + delegates to `--claude` | Unit | `.agents/scripts/bkit-cli.test.ts` |
| Help output lists modules + compose examples | Unit | `.agents/scripts/bkit-cli.test.ts` |
| `parseArgs` rejects unknown `--foo` flag with non-zero exit | Unit | `.agents/scripts/bkit-cli.test.ts` |
| `.bkit-version` first-run signal triggers extra logging (BKIT_READ_TOKEN setup, package.json scripts) | Integration | `.agents/scripts/bkit-modules.integration.test.ts` |

(Plus the cross-module dry-run parity tests staged in v4-2 Task 5.3 are promoted to green here once the dispatcher exists.)

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed.**

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until checked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

### Breaking Changes (v4-3 — backward-compatible at runtime, signalled via deprecation warns)

- **`bkit init` verb** — kept as deprecation stub through v0.1.x. Prints `[bkit] DEPRECATED: 'init' verb is replaced by 'install --full'; will be removed in v0.2`. Internally delegates to `install --full`. **No consumer scripts break in v0.1.x.**
- **`--host=claude` / `--host=cursor` flags** — kept as deprecation stubs through v0.1.x. Print `[bkit] DEPRECATED: --host=<x> is replaced by --<x>; will be removed in v0.2`. Treat as `--claude` / `--cursor`.
- **Removed in v0.2 (NOT this plan, but flagged for tracking)** — `init` verb, `--host=` flag.

### New Naming (v4-3)

- **CLI verbs:** `install`, `check`, `help` only (was `init`, `install`, `check`, `help`).
- **Module flags:** `--core`, `--claude`, `--cursor`, `--ci`, `--lint`, `--git-hooks`, `--full`.
- **New script files:** `.agents/scripts/bkit-cli.ts`, `.agents/scripts/bkit-modules.ts` (split from `bkit-install.ts` to keep each module under ~300 LOC).
- **README anchor:** new `## Consumer CI auth` section documenting `BKIT_READ_TOKEN` PAT setup.

### DB / API / Routes

None — bkit is a CLI tool, no database, no routes, no API contracts.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed.**

---

## Alternative Approaches & Recommendations

**Rejected (per master plan-input.md):**

- **3-way merge / versioned migrations** — overkill for v0.1.2.
- **`package.json` JSON-merging** — print-only this round; revisit in v0.2.
- **Husky auto-install (mutate consumer git config)** — too invasive; seed `.husky/` dir + print `prepare: husky install` script entry instead.
- **Helper auth action `cbartens/bkit/.github/actions/setup-auth@v1`** — out of scope; stays in BAR-131 for v0.2.
- **Reusable workflow distribution** — interesting v0.2 evolution.

**Future (route to `docs/pending.md` via Task 9.2):**

- `--no-X` invert flags / `--force` to override Tier 3 print-only.
- Helper auth action for consumer CI.

## Out of Scope (v4-3)

Per master `plan-input.md` (verbatim):

- `postflight.sh` and Stop-hook wiring.
- `package.json` automated merging.
- Prompted fallback for token detection.
- Husky auto-install.
- Reusable-workflow distribution.
- 3-way merge / versioned migrations.
- Helper action `cbartens/bkit/.github/actions/setup-auth@v1`.
- `--no-X` invert flags, `--force` to override Tier 3.
- `{{VERCEL_PROJECT_ID}}` / `{{LINEAR_TEAM_ID}}` token substitution.
- `claude.yml` / `ci-complete.yml` (BAR-120) / `smoke.yml` (project-specific).
- New CI workflows beyond `ci.yml`.

Sibling-level out-of-scope: bkit's own CI / lint config (v4-1); installer engine + templates (v4-2).

## Merge Method

**Squash.** Single PR `feat/bar-130-ci-lint-scaffolding` → `dev`. `bkit-ship.md` Step 3 hardcoded to `gh pr merge --squash --delete-branch --body ""`.

## Supersession Inventory

> v4-3 owns the FULL master Supersession Inventory — all six rows touch CLI surfaces inside this child's scope.

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `parseArgs()` in `.agents/scripts/bkit-install.ts` (verb + `--host=` model) | `parseArgs()` (verb + module-flag model) — extracted to `.agents/scripts/bkit-cli.ts` | DELETE | Verb + `--host=` model collapses into composable flags; single source of arg parsing |
| **File:** `.agents/scripts/bkit-init.ts` (84 LOC, standalone) | Body migrates into `runCoreModule` in `.agents/scripts/bkit-modules.ts` | DELETE | File body (additive `.agents/` payload copy + `.bkit-version` write) migrates verbatim into `runCoreModule`. The deprecation stub for the `init` *verb* lives in `bkit-cli.ts` (separate row below) — NOT in this file. File deletion is safe. |
| **CLI verb:** `bkit init` | Inline `init` deprecation stub in `bkit-cli.ts` that prints warn + delegates to `install --full` | RETAIN-WITH-REASON | External contract — kept as deprecation stub through v0.1.x; removal kill-date **v0.2**; follow-up tracked in `docs/pending.md` against Linear issue **BAR-200** (or equivalent v0.2 parking-lot issue created/referenced in Task 9.2). |
| **CLI flag:** `--host=claude\ | cursor` | `--claude` / `--cursor` module flags | RETAIN-WITH-REASON | External contract — deprecation stub through v0.1.x; removal kill-date **v0.2**; follow-up tracked in `docs/pending.md` against Linear issue **BAR-200** (or equivalent v0.2 parking-lot issue created/referenced in Task 9.2). |
| `runHost()` in `bkit-install.ts` (host-pass orchestrator) | Module functions in `bkit-modules.ts` (`runClaudeModule`, `runCursorModule`) | DELETE | Refactor — host-pass logic preserved verbatim, just relocated and split per module |
| `printUsage()` help string mentioning `init` + `--host=` | New help string with module-flag matrix + compose examples | DELETE | Old help is wrong post-CLI redesign |

> [!CAUTION]
> **`RETAIN-WITH-REASON` rows** for the `bkit init` verb + `--host=` flag carry an explicit kill-date (**v0.2**) and a follow-up Linear issue ID (**BAR-200**, created/referenced in Task 9.2) tracked in `docs/pending.md` per Supersession rules. The **file** `bkit-init.ts` is DELETE (body migrates to `runCoreModule`); the **verb** `init` is RETAIN-WITH-REASON (deprecation stub in `bkit-cli.ts`) — these are two distinct artifacts with two distinct decisions.

## Security & Privacy

- [x] **New secret/env var** — `BKIT_READ_TOKEN` (consumer-side GitHub Actions secret, fine-grained PAT with `Contents: read` on `cbartens/bkit`). Documented in README `## Consumer CI auth` (Task 8.1). Not stored anywhere bkit-side; consumer adds via GitHub Settings → Secrets.
- [x] **User input** — module flags parsed via allowlist in `parseArgs`; unknown flags hard-fail. No user-provided file paths (template paths are package-internal).
- [x] **PII** — none. Logs print file paths and write counts only.

_All other rows: N/A — no DB, no routes, no auth, no webhook, no notifications._

## 🚨 Pre-Flight / Dependencies 🚨

### Core (always verify)

- [ ] **Package Management:** `package.json` v0.1.1 entering v4-3 — bump to `0.1.2` in Task 10.1. `pnpm-lock.yaml` syncs cleanly post-bump.
- [ ] **Dependency Versions:** Verify `pnpm --version` (≥ 10), `node --version` (≥ 20), `tsc --version` (≥ 5.4). Vale optional (CI-only).
- [ ] **User Context:** Verify read/write on `.agents/scripts/`, `.agents/templates/`, `package.json`, `README.md`, `.agents/README.md`, `docs/decisions.md`, `docs/pending.md`, `docs/plans/logs/bar-130-ci-lint-scaffolding/`.
- [ ] **Pending Blockers:** Query Linear for open issues with `blocker` label affecting bkit. Confirm BAR-200 (or equivalent v0.2 parking-lot issue) exists for kill-date tracking — if absent, create via `mcp__claudeai_linear__create_issue` per Task 9.2.
- [ ] **Project Context:** v4-2 token resolver / tier writers / templates / dry-run parity must be merged or staged on the same branch.
- [ ] **Testing & Quality:** Vitest configured; tests co-located. `bkit-cli.test.ts` and `bkit-modules.integration.test.ts` stub files were created in v4-2 Task 0.2 — v4-3 fills them.
- [ ] **Prerequisite Plans:** **v4-1** (lint scripts, prettier devDep, bkit's CI workflow) AND **v4-2** (token resolver, tier writers, marker generalisation, dry-run parity, all template payloads) must be complete.

### Conditional

- [ ] **Architecture & UI:** N/A — CLI tool only.
- [ ] **Observability:** Bkit logs `[bkit-install]` / `[bkit-check]` prefix preserved across module dispatches; deprecation warns use `[bkit] DEPRECATED:` prefix consistently.
- [ ] **Secrets & Env Vars:** `BKIT_READ_TOKEN` is consumer-side only. No bkit-side secrets.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed.**
- [ ] **Breaking Changes confirmed.**
- [ ] **Gate 1 - Verified:** All Core checked; applicable Conditional checked; v4-1 + v4-2 prerequisites confirmed.

## Data Schema Integration

None.

## Architecture & Component Changes

### Database Migrations

None.

### C. CLI redesign (composable module flags)

#### [NEW] `.agents/scripts/bkit-cli.ts`

- Exports `parseArgs(argv: string[]): { verb, modules, deprecations }`.
- Parses: `install` | `check` | `help` | `init` (deprecation alias for `install --full`); module flags allowlist; unknown flag → exit 1 with error.
- Deprecation handling: `init` verb sets `deprecations.init = true`, normalises to `install --full`. `--host=claude` sets `deprecations.host = "claude"`, normalises to `--claude`. Same for cursor. Stub prints warn ONCE before module dispatch.
- Exports `printUsage()` — new help string with module-flag matrix + compose examples (per BAR-130 § CLI surface).

#### [NEW] `.agents/scripts/bkit-modules.ts`

- Exports module functions: `runCoreModule`, `runClaudeModule`, `runCursorModule`, `runCiModule`, `runLintModule`, `runGitHooksModule`. Each takes `{ dryRun, tokens, modelLookup, printSink }`.
- Module registry: `MODULE_REGISTRY: Record<ModuleFlag, ModuleFn>`.
- `runCoreModule` always runs first; other modules call it implicitly.
- `runClaudeModule` / `runCursorModule` extract the existing `runHost()` logic (kept byte-equivalent for the host-pass behaviour).
- `runCiModule` writes `.github/workflows/ci.yml` (Tier 2 hash-comment markers via v4-2's `bkit-tiers.writeTier2`) with auth-shim step inside the bkit block, all tokens substituted.
- `runLintModule` writes `.vale.ini` (Tier 2 hash-comment), `.vale/styles/House/**` (Tier 1), `slop-scan.config.json` (Tier 3), `.prettierignore` (Tier 2 hash-comment), and adds `package.json` script entries to print-sink.
- `runGitHooksModule` writes `.husky/pre-commit` and `.husky/pre-push` (Tier 2 hash-comment), and adds `prepare: "husky install"` to print-sink.

#### [MODIFY] `.agents/scripts/bkit-install.ts` (`main()` refactor + greenfield-guard removal)

- **Existence Check:** `.agents/scripts/bkit-install.ts` exists.
- Refactor `main()` to: (1) call `parseArgs` from `bkit-cli.ts`, (2) emit deprecation warns, (3) call `resolveTokens` once (from v4-2's `bkit-tokens.ts`), (4) dispatch through `MODULE_REGISTRY` per the parsed module set, (5) emit print-sink at end.
- Move `runHost` body into `runClaudeModule` / `runCursorModule` (in `bkit-modules.ts`); keep `runPayload` and `runTemplates` callable from `runCoreModule`.
- Remove the old greenfield guard at `bkit-install.ts` lines ~650–653 (Reviewer 2 C5).
- Remove `printUsage()` definition + any local references; route through `bkit-cli.ts`'s exported `printUsage`.

#### [DELETE] `.agents/scripts/bkit-init.ts`

- **Reason:** `init` collapses to `install --full`. The 84-line file's logic (additive copy of `.agents/` payload from `PKG_AGENTS` to consumer `cwd`, `.bkit-version` write) folds into `runCoreModule` in `bkit-modules.ts`.
- The `init` verb itself remains as a CLI deprecation stub through v0.1.x via `bkit-cli.ts` (separate concern from the file deletion).

### Cron Jobs & Scheduled Tasks

None.

### Architecture wiring (post-refactor)

```
parseArgs(argv)
  → { verb, modules: Set<ModuleFlag>, deprecations }
  → if deprecations: print warn lines
  → resolveTokens(cwd) → tokens
  → for module in [core, ...modules]: MODULE_REGISTRY[module]({ dryRun, tokens, ... })
  → flush printSink (Tier 3 suggested diffs + first-run BKIT_READ_TOKEN block + package.json scripts)
```

## Documentation Updates

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `README.md` | Replace `## Then in the consumer repo` block (lines 40-48) with new `bkit install` + module-flag examples; add `## Consumer CI auth` § documenting `BKIT_READ_TOKEN` PAT setup; document `init` deprecation. (Task 8.1) |
| `.agents/README.md` | Replace `## Distribution` + `## Install / regenerate` (lines 114-167) to reflect new CLI surface; add `## Three-tier file ownership` § (Tier 1/2/3 semantics, marker variants); update `### What install writes` table with new template paths (`.github/workflows/ci.yml`, `.vale.ini`, `.husky/`, `slop-scan.config.json`, `.cursor/hooks.json`, `.cursor/settings.json`, `.prettierignore`). (Task 8.2) |
| `docs/decisions.md` | Append `DE-{N}: Three-tier file-ownership model for bkit installer` and `DE-{N+1}: Composable module-flag CLI surface (collapse init+install+--host)`. (Task 9.1) |
| `docs/pending.md` | Append five rows with Linear issue IDs: `init` verb removal at v0.2 (BAR-200); `--host=` flag removal at v0.2 (BAR-200); helper auth action `setup-auth@v1` (BAR-131); `--no-X` / `--force` flags (future); `package.json` automated merging (future). (Task 9.2) |
| `docs/knowledge.md` | None expected pre-build; append if gotchas surface. |
| `docs/completed.md` | Append entry on ship (NOT this plan's responsibility — `bkit-ship` workflow handles it). |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **Code** | `git revert {squash-commit}` on `dev`; consumers running v0.1.2 fall back to v0.1.1 by re-pinning. | Code-only — no DB. |
| **Tag** | `git tag -d v0.1.2 && git push --delete origin v0.1.2` if shipped tag must vanish. | Re-tag from a fix commit if going forward. |
| **Risk window** | None (no production deploy; library tag-and-go). | Consumers control upgrade cadence via pinned ref. |

## Agent Execution Runbook

> [!IMPORTANT]
> Continuous execution. Each task: scope → acceptance → verification. Reproduce-first: failing test before code. Step Isolation: complete each task fully (incl. test pass + box check) before next.

### Phase 3 — CLI redesign (C)

- [ ] **Task 3.1 — Failing tests for `parseArgs`:** In `bkit-cli.test.ts`, write tests for: (a) `install`/`check`/`help` verbs, (b) module flags `--core`/`--claude`/`--cursor`/`--ci`/`--lint`/`--git-hooks`/`--full`, (c) `--full` ≡ no flags, (d) `init` deprecation alias, (e) `--host=claude` deprecation alias, (f) unknown flag exits 1, (g) help output contains module list + compose examples.
  - **Verification:** Tests red.

- [ ] **Task 3.2 — Implement `bkit-cli.ts`:** Create `.agents/scripts/bkit-cli.ts` exporting `parseArgs(argv)` returning `{ verb, modules: Set<ModuleFlag>, deprecations }` and `printUsage()`. Allowlist module flags; unknown → `process.exit(1)`.
  - **Acceptance:** Task 3.1 tests pass.
  - **Verification:** `pnpm test bkit-cli` green.

- [ ] **Task 3.3 — Deprecation warn assertions:** Add tests asserting deprecation warns are printed exactly once and include `DEPRECATED:` + `removed in v0.2` substring; assert behaviour delegates correctly (`init` → `install --full`; `--host=claude` → `--claude`).
  - **Verification:** Tests green.

### Phase 4 — Module dispatcher (C + B-3)

- [ ] **Task 4.1 — Failing integration tests for module dispatch:** In `bkit-modules.integration.test.ts`, write tests for: (a) `--claude` writes only `.claude/**` + `.bkit-version` + `rules.md` block + `.gitignore` block; nothing under `.cursor/`/`.github/`/`.vale*`/`.husky/`, (b) `--ci --lint` writes core + CI + lint stack; nothing under Cursor/Claude/Husky, (c) `--full` ≡ no flags writeset equality, (d) `--core` is implicit before any other module, (e) idempotent second run = zero writes.
  - **Verification:** Tests red (modules not yet implemented).

- [ ] **Task 4.2 — Implement `bkit-modules.ts`:** Create `.agents/scripts/bkit-modules.ts` with `runCoreModule`, `runClaudeModule`, `runCursorModule`, `runCiModule`, `runLintModule`, `runGitHooksModule`, and `MODULE_REGISTRY`. Move `runHost` body verbatim into Claude/Cursor module fns. `runCoreModule` absorbs `runInit` body + payload pass + `.bkit-version` write.
  - **Acceptance:** Task 4.1 tests pass.
  - **Verification:** `pnpm test bkit-modules` green; `pnpm typecheck` green.

- [ ] **Task 4.3 — Wire `bkit-install.ts` `main()` to module dispatcher + remove greenfield guard (Reviewer 2 C5):** Refactor `main()` — call `parseArgs` from `bkit-cli.ts`, resolve tokens, dispatch through `MODULE_REGISTRY` per parsed module set, emit print-sink at end. Preserve existing log prefix conventions (`[bkit-install]` / `[bkit-check]`).
  - **Sub-step (Reviewer 2 C5):** Remove (or relax) the existing pre-dispatch guard `if (verb !== "init" && !fs.existsSync(".agents/prompts.md"))` at `bkit-install.ts` lines ~650–653. Rationale: with the new module surface, `bkit install --ci` (and any other module) on a greenfield repo MUST work — `--core` is implicitly prepended and `runCoreModule` will create `.agents/` including `prompts.md`. Replacement behaviour:
    - **Preferred:** Delete the guard entirely. `runCoreModule` is responsible for ensuring `.agents/prompts.md` exists (via additive payload copy from `PKG_AGENTS`). Any module that depends on `prompts.md` runs _after_ `runCoreModule`.
    - **Fallback (if deletion proves risky):** Move the guard inside any module function that actually reads `prompts.md` (e.g., agent host modules), so installing `--ci` alone on a clean repo does not get rejected.
  - **Sub-step (Reviewer 1 #7):** In `runCoreModule` ordering, ensure `.bkit-version` write is sequenced **AFTER** all other core writes (additive `.agents/` payload copy, `rules.md` Tier 2 block update, `.gitignore` Tier 2 block update). Rationale: a mid-install crash between Tier 1 and Tier 2 leaves `.bkit-version` unwritten, so `bkit install` re-run is correctly detected as upgrade-needed (per Edge Case row).
  - **Sub-step (Auditor 2 CRITICAL C5 — `printUsage` DELETE verification):** After `printUsage()` is extracted into `bkit-cli.ts` (Task 3.2) and `main()` in `bkit-install.ts` is refactored to route help through `bkit-cli.ts`, run `grep -n 'printUsage' .agents/scripts/bkit-install.ts`. MUST return zero hits — the old definition + any local references in `bkit-install.ts` must be gone (callers now route through `bkit-cli.ts`'s exported `printUsage`). If `bkit-install.ts` needs to invoke usage-printing it must `import { printUsage } from "./bkit-cli"` — confirmed via `grep -n 'from "./bkit-cli"' .agents/scripts/bkit-install.ts` returning ≥ 1 hit.
  - **Acceptance:** All existing tests still green; integration tests from Task 4.1 green; `bkit install --ci` against a clean tmpdir (no `.agents/`) succeeds; `bkit install --ci` mid-crash simulation leaves `.bkit-version` absent so re-run replays. **Binary grep:** `grep -c 'printUsage' .agents/scripts/bkit-install.ts` = 0 (old definition fully removed).
  - **Verification:** `pnpm test` whole-suite green; `pnpm typecheck` green; `grep -n 'printUsage' .agents/scripts/bkit-install.ts` returns no matches.

- [ ] **Task 4.4 — Delete `bkit-init.ts`:** After verifying `runCoreModule` covers all `runInit` semantics (additive copy, `.bkit-version` write last per Task 4.3), delete `.agents/scripts/bkit-init.ts`. Update import in `bkit-install.ts` (`runInit` import → removed; deprecation stub in `bkit-cli.ts` calls `install --full`).
  - **Acceptance:** No references to `bkit-init.ts` remain. Run `grep -r 'bkit-init' .agents/ tsconfig.json package.json` — zero hits.
  - **Verification:** `pnpm test` green; `pnpm typecheck` green; `pnpm build` (`tsc`) succeeds; resulting `dist/` has no `bkit-init.js`.

- [ ] **Task 4.5 — Add `.bkit-version` write-order regression test (Reviewer 1 #7):** Add a test in `bkit-modules.integration.test.ts` that:
  - Sets up a tmpdir.
  - Runs `runCoreModule` against it.
  - Asserts the order of writes by inspecting a synthetic write-log: `.agents/` payload copies happen first, then `rules.md` block update, then `.gitignore` block update, then **finally** `.bkit-version`. (Test the contract via the WriteSet accumulator from v4-2 Phase 5, or by hooking `fs.writeFileSync` and recording call order, or by inspecting a list of paths returned from `runCoreModule`.)
  - Assert that if any earlier write throws (mocked failure), `.bkit-version` is NOT written.
  - **Sub-step (Auditor 2 CRITICAL C4 — `runHost` DELETE verification):** After Task 4.2 migrates `runHost` body into `runClaudeModule`/`runCursorModule`, add a grep-based dead-code verification: `grep -n 'runHost' .agents/scripts/bkit-install.ts` MUST return zero hits (no `function runHost`, no exported `runHost`, no internal calls). Mirror check: `grep -nE 'runHost\b' .agents/scripts/` may only return hits in `.test.ts` history-removal contexts or in `bkit-modules.ts` import-renames; document any non-zero hit inline with rationale. Acceptance is binary: `grep -c 'runHost' .agents/scripts/bkit-install.ts` = 0.
  - **Verification:** Test green; `grep -n 'runHost' .agents/scripts/bkit-install.ts` returns no matches; `pnpm build` succeeds with no dead `runHost` export.

- [ ] **Task 4.6 — `.bkit-version` first-run signal extra-logging test (Auditor 2 CRITICAL C3 — closes orphaned Test Matrix row):** Add a test in `bkit-modules.integration.test.ts` asserting that the print-sink emits the BKIT_READ_TOKEN setup block + `package.json` script entries ONLY on first install (when `.bkit-version` is absent in the tmpdir at start) and is SUPPRESSED on the idempotent second run (when `.bkit-version` already exists at the version being installed).
  - **Setup:** tmpdir without `.bkit-version`; capture print-sink during `runFull` (or `runCoreModule` + relevant modules); assert print-sink contains `BKIT_READ_TOKEN` substring AND a `package.json` script-entry suggestion (e.g., `"lint:prose"`).
  - **Second run:** call again with `.bkit-version` now present at `0.1.2`; capture print-sink; assert print-sink does NOT contain `BKIT_READ_TOKEN` substring AND does NOT contain the `package.json` script-entry suggestion (extra-logging suppressed because `.bkit-version` signals consumer is already onboarded).
  - **Acceptance:** both assertions green; the binary signal `.bkit-version absent → emit; present → suppress` is enforced.
  - **Verification:** `pnpm test bkit-modules` green; matrix row "`.bkit-version` first-run signal triggers extra logging (BKIT_READ_TOKEN setup, package.json scripts)" mapped to this task.

### Phase 8 — README + .agents/README docs

- [ ] **Task 8.1 — Rewrite `README.md` install/usage block:** Replace lines 40-48 (`## Then in the consumer repo` + the three `bkit init/install/check` examples) with new module-flag examples per BAR-130 § CLI surface. Add new `## Consumer CI auth` section documenting `BKIT_READ_TOKEN` fine-grained PAT (`Contents: read` on `cbartens/bkit`), GitHub Settings → Secrets path, copy-paste workflow snippet showing `${{ secrets.BKIT_READ_TOKEN }}` usage. Document `init` deprecation.
  - **Verification:** `grep -E '(bkit init|--host=)' README.md` returns only deprecation context; new module-flag examples present.

- [ ] **Task 8.2 — Rewrite `.agents/README.md`:** Replace `## Distribution` + `## Install / regenerate` (lines 114-167) with new CLI surface. Add `## Three-tier file ownership` section describing Tier 1/2/3 + marker variants. Update `### What install writes` table to include new template paths (`.github/workflows/ci.yml`, `.vale.ini`, `.husky/pre-{commit,push}`, `slop-scan.config.json`, `.cursor/{hooks,settings}.json`, `.prettierignore`).
  - **Acceptance (binary — Auditor 2 CRITICAL C2 — DoD bullet 16):** every assertion below must produce the stated grep result against the rewritten `.agents/README.md`:
    - `grep -c '^## Three-tier file ownership' .agents/README.md` ≥ 1 (section heading present).
    - `grep -c 'install --claude' .agents/README.md` ≥ 1 (module-flag CLI example present).
    - `grep -c '^## ' .agents/README.md` includes (a) the new three-tier section AND (b) the rewritten distribution/install section.
    - `grep -E '\.github/workflows/ci\.yml|\.vale\.ini|\.husky/pre-commit|slop-scan\.config\.json|\.cursor/hooks\.json|\.cursor/settings\.json|\.prettierignore' .agents/README.md` returns ≥ 6 distinct lines (every new template path appears in the `### What install writes` table).
    - `grep -E 'bkit init' .agents/README.md` ONLY appears in deprecation context (no instructional example in active sections).
  - **Verification:** All five greps produce expected counts; deviation = task fails.

### Phase 9 — Docs ledgers

- [ ] **Task 9.1 — Append `docs/decisions.md`:** Add `DE-{N}: Three-tier file-ownership model for bkit installer` (category `agentic`, status `active`, decision/why/discarded `3-way merge`/related BAR-130 paths). Add `DE-{N+1}: Composable module-flag CLI (collapse init+install+--host=)` (category `agentic`, status `active`, related BAR-130/BAR-112).
  - **Verification:** Both rows present, append-only at EOF (inside `<!-- bkit:start ... bkit:end -->`).

- [ ] **Task 9.2 — Append `docs/pending.md` with enforceable kill-dates (Reviewer 1 #4):** Add deferred items (per Out of Scope), each with an explicit Linear issue ID so kill-dates are enforceable:
  - **`init` verb removal at v0.2** — must reference Linear issue **BAR-200** (or whichever v0.2 parking-lot issue exists/created). If no such issue exists, create one in Linear via `mcp__claudeai_linear__create_issue` (or document the explicit need to create it before merge) titled "v0.2: remove `init` verb + `--host=` flag deprecation stubs from bkit CLI".
  - **`--host=` flag removal at v0.2** — same Linear issue (BAR-200) — single removal sweep covers both deprecation stubs.
  - **Helper auth action `setup-auth@v1`** — references **BAR-131** (already exists; deferred to v0.2 consideration there).
  - **`--no-X` / `--force` flags** — references future issue (e.g., BAR-201 or `bkit/v0.2-cli-improvements` parking lot); create if absent.
  - **`package.json` automated merging** — references future issue (e.g., BAR-202).
  - **Verification:** Five rows appended; each row contains a Linear issue ID (`BAR-XXX`) — no prose-only kill-dates.

### Phase 10 — Final ship prep

- [ ] **Task 10.1 — Bump `package.json` version:** Edit `package.json` — `"version": "0.1.1"` → `"0.1.2"`.
  - **Verification:** `jq -r .version package.json` outputs `0.1.2`.

- [ ] **Task 10.2 — Run full pre-PR gate (Reviewer 1 #5):** bkit is a single-package repo with NO `turbo.json` and NO `turbo` devDep — the `pnpm turbo …` invocation does not apply. Run the direct-pnpm sequential equivalent:

  ```
  pnpm lint:prose && pnpm lint:slop && pnpm typecheck && pnpm format:check && pnpm test
  ```

  Per `.agents/rules.md` § Testing & Debugging: lint + typecheck + format:check + unit only. (No top-level `pnpm lint` aggregate script is added by this plan; the two lint scripts run sequentially.)
  - **Note (Reviewer 1 boundary check):** bkit's `*.integration.test.ts` files are filesystem-only (real `os.tmpdir()` + `process.chdir`); no DB, no live API. They are fast and safe to run pre-PR alongside unit tests via `pnpm test` (Vitest single-suite). Project rule "Integration and E2E: post-PR" is honored in spirit — bkit's integration tier is filesystem-fast and does not need post-PR gating.
  - **Verification:** All five steps green; `pnpm test` runs both `*.test.ts` and `*.integration.test.ts` in one Vitest invocation.

- [ ] **Task 10.3 — Manual smoke-install against `app-gether-life`:** Document (NOT auto-run) the manual verification step for `bkit-build` agent or human reviewer:
  - Pin `app-gether-life` to local `bkit` worktree via `pnpm add -D ../path/to/bkit`.
  - Run `pnpm exec bkit check --full` first → expect drift report (since v0.1.1 → v0.1.2).
  - Run `pnpm exec bkit install --full` → confirm only expected new files appear; no consumer-content clobbered.
  - Run `pnpm exec bkit check --full` second → exit 0 (idempotent).
  - Verify `ci.yml` has resolved tokens (Node 22, pnpm 10, branch `main`); `BKIT_READ_TOKEN` documented.
  - **Verification:** Commit a manual-verification log to `docs/plans/logs/bar-130-ci-lint-scaffolding/smoke-install.md` with timestamp + diff summary.

- [ ] **Task 10.4 — Tag-push handoff to `bkit-ship` (Auditor 2 CRITICAL C1 — DoD bullet 15):** This plan's scope ends at "version bumped to `0.1.2` in `package.json`" (Task 10.1); the actual `git tag v0.1.2` + `git push origin v0.1.2` is owned by the `bkit-ship` workflow run AFTER squash-merge to `dev` and human-approved promotion to `main`. To make the handoff verifiable (not a hand-wave):
  - **Acceptance (binary):** Confirm the `bkit-ship` workflow / runbook contains a step that derives the tag from `jq -r .version package.json` (so it picks up `0.1.2` automatically post-merge). Run `grep -nE 'jq -r \.version|package\.json.*version|v0\.1\.2' .agents/workflows/bkit-ship.md` (or the actual `bkit-ship` runbook path) — at least one match required, OR explicitly note that the ship workflow auto-derives the tag from `package.json` and link the line(s).
  - **Out-of-scope clarification:** DoD bullet 15 is split — "version bumped" (verified by Task 10.1) is THIS plan; "tag pushed" is THE SHIP workflow's contract. If the `bkit-ship` runbook does NOT yet auto-derive from `package.json`, append a follow-up entry to `docs/pending.md` (FID `bar-130-ci-lint-scaffolding`, reason "bkit-ship tag-derivation hardening", Linear issue: create or reference an existing ship-workflow tracking issue) — do NOT silently expand THIS plan's scope.
  - **Verification:** `grep` audit produces ≥1 hit OR the pending.md entry exists. Either branch closes the gate.

### 🔒 Gate 2: Code Implementation Check

- [ ] **Gate 2 - Verified:** Every task above (Phases 3, 4, 8, 9, 10 — 17 tasks) checked off and independently verified.

> [!IMPORTANT]
> **Testing Strategy:** Vitest unit (`*.test.ts`) and integration (`*.integration.test.ts`) co-located with source under `.agents/scripts/`. No Playwright (no UI). Mocking strategy: real fs against `os.tmpdir()` + `process.chdir`.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Cross-check every v4-3 Test Matrix row against a runbook task — all 10 rows mapped (Phase 3 + Phase 4 cover all).
- [ ] **Audit `it.todo` promotion (Auditor 1 CRITICAL #4 — closes Phase 0.2 stub loophole):** Run `grep -nE "it\.todo|test\.todo" .agents/scripts/bkit-tokens.test.ts .agents/scripts/bkit-tiers.test.ts .agents/scripts/bkit-cli.test.ts .agents/scripts/bkit-modules.integration.test.ts .agents/scripts/bkit-dry-run-parity.integration.test.ts` and assert ZERO hits. Every `it.todo()` placeholder seeded in v4-2 Task 0.2 MUST have been promoted to a real `it()` (red-then-green) before Gate 2 closes. If the grep returns any line, Gate 3 cannot close until the offending todos are either promoted or explicitly justified inline (with a documented Linear follow-up reference) and the justification logged in `docs/knowledge.md`.
- [ ] **Update existing tests:** Existing `bkit-install.test.ts` (already extended in v4-2) plus any tests touching `runHost` / `printUsage` / `runInit` removal must reflect the new module surface.
- [ ] **Write new tests:** Two test files filled in v4-3 (`bkit-cli.test.ts`, the bulk of `bkit-modules.integration.test.ts`).
- [ ] **Verify observability:** Bkit logs `[bkit-install]` / `[bkit-check]` prefix preserved across all module dispatches; deprecation warns use `[bkit] DEPRECATED:` prefix consistently. No PII; no log drains.
- [ ] **Update documentation:** `README.md`, `.agents/README.md`, `docs/decisions.md`, `docs/pending.md` updated per Phase 8/9.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** All Documentation Updates rows completed.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

## Verification Plan

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm typecheck` (`tsc --noEmit`) green; `pnpm format:check` green.
- [ ] **Unit + Integration:** `pnpm test` runs all `*.test.ts` + `*.integration.test.ts`. v4-3 contributes the CLI tests (~7) + the bulk of module dispatch / idempotence / first-run / write-order integration tests (~6); v4-2's tests stay green.
- [ ] **Build:** `pnpm build` (`tsc`) emits `dist/bkit-install.js`, `dist/bkit-tokens.js`, `dist/bkit-tiers.js`, `dist/bkit-cli.js`, `dist/bkit-modules.js`. **No `dist/bkit-init.js`** (file deleted in Task 4.4).
- [ ] **Self-test:** `pnpm tsx .agents/scripts/bkit-install.ts check` exits 0 (bkit-the-repo is in sync with its own templates after Phase 7 in v4-1 and template payloads in v4-2).
- [ ] **CI on PR:** `.github/workflows/ci.yml` (added by v4-1) runs all gates green on the PR for this branch.

### 🔒 Gate 4: Automated Verification Confirmed

- [ ] **Gate 4 - Verified:** Every Automated Tests checkbox checked. CI run output captured.

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** Use `gh run list --branch feat/bar-130-ci-lint-scaffolding`, `gh run view --log-failed`, etc. — no GitHub UI checks.

- [ ] **Step 1 — `bkit init` deprecation:** `pnpm tsx .agents/scripts/bkit-install.ts init` against fresh tmpdir → stderr contains `DEPRECATED: 'init'`; functionally equivalent to `install --full`.
- [ ] **Step 2 — `--host=` deprecation:** `pnpm tsx .agents/scripts/bkit-install.ts install --host=claude` against fresh tmpdir → stderr contains `DEPRECATED: --host=`; only `.claude/` written.
- [ ] **Step 3 — Module composition:** `pnpm tsx .agents/scripts/bkit-install.ts install --ci --lint` against fresh tmpdir → only `.github/workflows/ci.yml`, `.vale*`, `slop-scan.config.json`, `.prettierignore`, `.bkit-version`, `.gitignore` block, `rules.md` block, `.agents/` payload written; nothing under `.cursor/`, `.claude/`, `.husky/`.
- [ ] **Step 4 — Token substitution:** Pre-seed tmpdir with `.nvmrc: 22\n` + `package.json {"name": "x", "packageManager": "pnpm@10.4.1"}` + `git init` with `main` branch → `bkit install --ci` → seeded `ci.yml` has `node-version: 22`, pnpm version `10`, `branches: [main]`.
- [ ] **Step 5 — Idempotence:** Second run after Step 3 → 0 writes / 0 deletes reported.
- [ ] **Step 6 — Dry-run parity:** `bkit check --full` writeset = `bkit install --full` writeset (compare console output line-by-line on identical starting state).
- [ ] **Step 7 — `app-gether-life` smoke-install (DoD bullet 13):** Per Task 10.3 — local `pnpm link` + `bkit install --full`; consumer's CI runs green on next PR after `BKIT_READ_TOKEN` is configured. **MUST be confirmed before merge** via Gate 4.5a below.
- [ ] **Step 8 — Second consumer onboarding (DoD bullet 14):** `www-visitfrasercoast-com` (or other) runs `bkit install --full` (replacing `bkit init`); CI green on first run after secret + allowlist setup. **Separate human session — not auto.** Confirmed via Gate 4.5b below.

### 🔒 Gate 4.5: Manual Smoke Confirmation (DoD bullets 13 + 14) — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 Reviewer 2 C4 — this gate blocks merge.** DoD bullets 13 and 14 (`app-gether-life` re-install + second-consumer onboarding) are NOT covered by automated verification (Gate 4). Without this gate, the build agent could mark Gate 4 passed and open the PR while bullets 13/14 are still open. **Plan does NOT pass until both checkboxes below are checked by a human (or `bkit-build` agent acting on confirmed artefacts).**

- [ ] **Gate 4.5a — `app-gether-life` smoke confirmed (DoD bullet 13):** Manual smoke-install log committed to `docs/plans/logs/bar-130-ci-lint-scaffolding/smoke-install.md` per Task 10.3; `app-gether-life` CI green on first PR post-upgrade. Human reviewer signs the log entry with timestamp + `git diff` summary.
- [ ] **Gate 4.5b — Second consumer confirmed (DoD bullet 14):** `www-visitfrasercoast-com` (or other) onboarding completed by human; CI green on first run after secret + allowlist setup. Log entry appended to `docs/plans/logs/bar-130-ci-lint-scaffolding/smoke-install.md` (or a sibling `second-consumer.md`).
- [ ] **Gate 4.5 - Verified:** Both 4.5a + 4.5b checked; merge unblocked.
