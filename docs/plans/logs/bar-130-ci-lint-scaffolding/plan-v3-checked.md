Verdict: PASS
<!-- verdict:end -->

Verdict: PASS
<!-- verdict:end -->

<!-- verdict: PASS -->
PASS — Plan grounded in real file paths (`.agents/scripts/bkit-install.ts`, `.agents/templates/`, `package.json` v0.1.1), absorbs all DoD bullets from BAR-130, splits cleanly across the three scopes (A/B/C), and is single-session-executable top-to-bottom. Tests are co-located with code (Reproduce-first); no deferred verification.
<!-- verdict:end -->

# BAR-130 — CI lint scaffolding + module-flag CLI Implementation Plan

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual `plan-v1-draft.md` natively via `Read` _before_ executing any steps.
> 2. NEVER trust system summaries or prior conversation to determine what is done.
> 3. Source of truth: literal `[x]` vs `[ ]` checkboxes below.

## Context & Goals

bkit `v0.1.1` extracted only the agent-orchestration core (`.agents/`, host mirroring, managed-block templates) and shipped zero CI/lint discipline. Consumers (e.g. `app-gether-life`) hit predictable friction: no PR gates in bkit itself, no seeded `ci.yml` / Vale / slop-scan stack, broken private-repo CI auth, dry-run/install write-set mismatch, fragmented `init` + `install` + `--host=` CLI surface. This plan ships `v0.1.2` to close those gaps in one cut.

Three scopes, one ship:

- **(A) bkit-the-repo gates its own PRs** — adds `ci.yml`, Vale, slop-scan, prettier, lint scripts to bkit itself so every bkit PR runs the same gates it ships to consumers.
- **(B) bkit-the-installer scaffolds the same stack into consumers** — extends `bkit-install.ts` with a three-tier file-ownership model (Tier 1 fully managed, Tier 2 managed-block with format-specific markers, Tier 3 seed-or-print) and bakes in token substitution + private-repo CI auth-shim.
- **(C) CLI redesign** — collapses `init` + `install` + `--host=` into a single `install` verb with composable module flags (`--core`, `--claude`, `--cursor`, `--ci`, `--lint`, `--git-hooks`, `--full`). `init` and `--host=` kept as deprecation stubs through v0.1.x.

**Success Criteria:**

- `bkit install` (no flags) on an empty repo seeds the full stack across all three tiers; second run = zero diff (idempotent).
- `bkit check --full` write-set ≡ `bkit install --full` write-set (regression-tested against the 14-vs-15 mismatch reproduced in `app-gether-life`).
- bkit's own PRs run typecheck + vitest + Vale + slop-scan + self-test before merge.

> [!WARNING]
> **Scope size — multi-session expectation (Reviewer 1 #1).** The Runbook contains ~36 distinct tasks across new modules (`bkit-tokens.ts`, `bkit-tiers.ts`, `bkit-cli.ts`, `bkit-modules.ts`), deletion of `bkit-init.ts`, ~21 new tests, six new template payloads, self-gating CI workflow, README + `.agents/README.md` rewrites, and decisions/pending appends. **Single-session ship is unrealistic.** Phases are structured as commit-able milestones (each phase ends in green tests + typecheck) so partial progress is preservable. Build orchestrator should treat each phase boundary as a checkpoint and route any over-budget work to a follow-up session **without silent deletions**. Complexity-check step decides whether to split into BAR-130A/B/C/D sub-issues — **no in-scope work is removed by this plan**; all 14 DoD bullets remain covered.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract for the feature. Everything below — implementation, tests, verification — derives from what you confirm here.

### Spec — what good looks like

Subagents follow this spec. Plan phase inherits design narrative + criteria; expands edges, examples, and the test matrix. No fabrication.

### Narrative _(no design draft — taken from BAR-130 description)_

A consumer adds `@cbartens/bkit@v0.1.2` to their repo, runs `bkit install --full` once on a non-empty project, and gets a complete, idempotent agent + CI + lint + git-hooks stack — bkit-managed blocks injected without clobbering existing files, tokens (`{{NODE_VERSION}}`, `{{PNPM_VERSION}}`, `{{DEFAULT_BRANCH}}`, `{{PROJECT_NAME}}`) substituted from project state, dry-run/install parity preserved, and the private-repo CI auth-shim seeded so first PR CI passes.

### Success Criteria

1. `bkit install` (no flags ≡ `--full`) on empty repo seeds files across all three tiers; `git diff` shows expected additions only.
2. Selective module install (`bkit install --claude`, `bkit install --ci --lint`) seeds only the requested modules + `--core`; other dirs untouched.
3. `bkit install --ci` on repo with existing customised `ci.yml` injects the bkit-managed `bkit-gates` job inside markers without clobbering consumer's other jobs; substitutes Node/pnpm/branch values from project state.
4. `bkit check --full` writeset equals `bkit install --full` writeset for any starting state (regression test with mock fs).
5. `bkit init` and `bkit install --host=claude` print deprecation warn and run the new equivalent (`install --full`, `install --claude`).

### Concrete Example

**Setup:** Maintainer of `www-visitfrasercoast-com` (existing pnpm 10 monorepo, Node 22, `main` default branch, has `.gitignore` + `.github/workflows/ci.yml` with 2 custom jobs, no `.cursor/`/`.claude/`/`.vale*`/`.husky/`).

**Steps:**

1. User runs `pnpm add -D github:cbartens/bkit#v0.1.2` → pnpm clones, builds `dist/`.
2. User runs `pnpm exec bkit install --full` → console prints managed writes per file; tokens resolved (`node-version: 22`, `pnpm/action-setup` major `10`, `branches: [main]`); `.github/workflows/ci.yml` gains `bkit-gates` job inside `# bkit:start ... # bkit:end` markers; `.gitignore` gains bkit block; `.vale.ini` / `.vale/styles/House/**` / `slop-scan.config.json` / `.prettierignore` written; `.husky/pre-commit` and `.husky/pre-push` seeded; `.bkit-version` = `0.1.2` written; print-only block at end of run lists `package.json` script entries to add.
3. User adds the printed `package.json` entries + `pnpm.onlyBuiltDependencies: ["@cbartens/bkit"]` allowlist + sets `BKIT_READ_TOKEN` GitHub Actions secret per README.
4. User runs `pnpm exec bkit check --full` → exits 0 (no drift).
5. User pushes PR → CI uses auth-shim, `pnpm install` succeeds, all gates pass.

**Outcome:** Repo has full bkit stack; consumer's pre-existing CI jobs preserved; second `bkit install --full` is a no-op.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| `ci.yml` exists with consumer customisations + no bkit markers | Append `# bkit:start … # bkit:end` block at EOF containing `bkit-gates` job; preserve consumer jobs above |
| `slop-scan.config.json` exists (Tier 3, comment-less JSON) | Preserve consumer file; print suggested diff to stdout; exit 0 |
| `.nvmrc` absent + `package.json.engines.node` absent | `{{NODE_VERSION}}` falls back to default `22`; install does NOT abort |
| `package.json.name` absent | Hard-fail with non-zero exit + clear error (`{{PROJECT_NAME}}` is required) |
| Vale binary not in `$PATH` on dev machine | `lint:prose` script no-ops with warn; CI workflow installs Vale itself |
| Consumer previously installed via `bkit init --host=cursor` | `bkit init` prints deprecation, runs `install --full`; consumer's `.cursor/` updated, `.claude/` newly seeded |
| `bkit check --ci` on repo where `ci.yml` block content is stale | Exits non-zero; `bkit install --ci` writes the new block; second `bkit check --ci` exits 0 |
| Mid-install crash between Tier 1 rewrite of `.cursor/hooks.json` and Tier 2 update of `ci.yml` | Plan accepts non-atomicity for v0.1.2 (rerun fixes); `--core` `.bkit-version` write moved to LAST step so partial = still detectable as upgrade-needed |
| `--full` invoked with `--ci` (redundant) | Both resolve to all modules; no double-write per module (idempotent module dispatch) |

### Derived Test Matrix

> Each row → one Agent Execution Runbook task. All Vitest unit/integration; Playwright N/A (no UI).

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Token resolver: `.nvmrc` → major; `package.json.engines.node` fallback; default `22` | Unit | `.agents/scripts/bkit-tokens.test.ts` |
| Token resolver: `package.json.packageManager` `pnpm@10.4.1` → `10`; default `10` | Unit | `.agents/scripts/bkit-tokens.test.ts` |
| Token resolver: `git symbolic-ref refs/remotes/origin/HEAD` → branch; default `main` | Unit | `.agents/scripts/bkit-tokens.test.ts` |
| Token resolver: `package.json.name` → required; absent → error | Unit | `.agents/scripts/bkit-tokens.test.ts` |
| Token substitution applied once per install at write-time (not template-read time) | Unit | `.agents/scripts/bkit-tokens.test.ts` |
| Hash-comment marker variant (`# bkit:start`/`# bkit:end`) round-trips for YAML/INI/shell | Unit | `.agents/scripts/bkit-install.test.ts` |
| Tier 1 fully-managed write: `.cursor/hooks.json` always rewritten verbatim | Unit | `.agents/scripts/bkit-tiers.test.ts` |
| Tier 2 managed-block: existing `ci.yml` with consumer jobs → block appended at EOF; consumer preserved | Unit | `.agents/scripts/bkit-tiers.test.ts` |
| Tier 3 seed-or-print: `slop-scan.config.json` exists → no write; suggested-diff printed to stdout | Unit | `.agents/scripts/bkit-tiers.test.ts` |
| Module dispatch: `--claude` writes only `.claude/**` + core; no `.cursor/`/`.github/`/`.vale*` | Integration | `.agents/scripts/bkit-modules.integration.test.ts` |
| Module dispatch: `--ci --lint` writes core + CI + lint stack; no Cursor/Claude/Husky | Integration | `.agents/scripts/bkit-modules.integration.test.ts` |
| `--full` ≡ no flags (writeset equality) | Integration | `.agents/scripts/bkit-modules.integration.test.ts` |
| `--core` is implicit before any other module (auto-prepend) | Integration | `.agents/scripts/bkit-modules.integration.test.ts` |
| Dry-run parity: `check --full` writeset ≡ `install --full` writeset (regression of 14-vs-15 bug) | Integration | `.agents/scripts/bkit-dry-run-parity.integration.test.ts` |
| Idempotence: `install --full` then `install --full` → second run zero writes/zero deletes | Integration | `.agents/scripts/bkit-modules.integration.test.ts` |
| `bkit init` deprecation: prints warn + delegates to `install --full` | Unit | `.agents/scripts/bkit-cli.test.ts` |
| `bkit install --host=claude` deprecation: prints warn + delegates to `--claude` | Unit | `.agents/scripts/bkit-cli.test.ts` |
| Help output lists modules + compose examples | Unit | `.agents/scripts/bkit-cli.test.ts` |
| `parseArgs` rejects unknown `--foo` flag with non-zero exit | Unit | `.agents/scripts/bkit-cli.test.ts` |
| Token-substituted `ci.yml` template renders auth-shim step inside bkit block | Unit | `.agents/scripts/bkit-install.test.ts` (extend) |
| `.bkit-version` first-run signal triggers extra logging (BKIT_READ_TOKEN setup, package.json scripts) | Integration | `.agents/scripts/bkit-modules.integration.test.ts` |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** Narrative, Success Criteria, Concrete Example, Edge Cases, Derived Test Matrix correctly describe done.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until checked. Summary issues `REVISE` if unchecked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**

### Breaking Changes (v0.1.2 — backward-compatible at runtime, signalled via deprecation warns)

- **`bkit init` verb** — kept as deprecation stub through v0.1.x. Prints `[bkit] DEPRECATED: 'init' verb is replaced by 'install --full'; will be removed in v0.2`. Internally delegates to `install --full`. **No consumer scripts break in v0.1.x.**
- **`--host=claude` / `--host=cursor` flags** — kept as deprecation stubs through v0.1.x. Print `[bkit] DEPRECATED: --host=<x> is replaced by --<x>; will be removed in v0.2`. Treat as `--claude` / `--cursor`.
- **Removed in v0.2 (NOT this plan, but flagged for tracking)** — `init` verb, `--host=` flag.

### New Naming

- **CLI verbs:** `install`, `check`, `help` only (was `init`, `install`, `check`, `help`).
- **Module flags:** `--core`, `--claude`, `--cursor`, `--ci`, `--lint`, `--git-hooks`, `--full`.
- **Marker variants:** add hash-comment variant `# bkit:start` / `# bkit:end` (HTML-comment markdown variant `<!-- bkit:start -->` retained).
- **New script files:** `.agents/scripts/bkit-tokens.ts`, `.agents/scripts/bkit-tiers.ts`, `.agents/scripts/bkit-modules.ts` (split from `bkit-install.ts` to keep each module under ~300 LOC).
- **Test files:** `bkit-tokens.test.ts`, `bkit-tiers.test.ts`, `bkit-cli.test.ts`, `bkit-modules.integration.test.ts`, `bkit-dry-run-parity.integration.test.ts`.
- **README anchor:** new `## Consumer CI auth` section documenting `BKIT_READ_TOKEN` PAT setup.

### DB / API / Routes

None — bkit is a CLI tool, no database, no routes, no API contracts.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** Reviewed all breaking changes and naming.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until checked.

---

## Alternative Approaches & Recommendations

**Rejected (per plan-input.md disambiguations):**

- **3-way merge / versioned migrations** — overkill for v0.1.2; tier-based ownership solves 95% of cases at ~10% of complexity.
- **`package.json` JSON-merging** — real correctness hazard; print-only this round, revisit in v0.2.
- **Husky auto-install (mutate consumer git config)** — too invasive; seed `.husky/` dir + print `prepare: husky install` script entry instead.
- **Prompted token-detection fallback** — non-interactive only in v0.1.2; revisit if "all defaults fail" cases prove painful.
- **Helper auth action `cbartens/bkit/.github/actions/setup-auth@v1`** — out of scope; stays in BAR-131 for v0.2.
- **Reusable workflow distribution** (`uses: cbartens/bkit/.github/workflows/gates.yml@v0.1.2`) — interesting v0.2 evolution once auth story is solid.

**Future (route to `docs/pending.md`):**

- `--no-X` invert flags / `--force` to override Tier 3 print-only.
- Helper auth action for consumer CI (BAR-131 v0.2 consideration).

## Out of Scope

Per BAR-130 description (verbatim):

- `postflight.sh` and Stop-hook wiring (`postflight.sh` stays project-specific).
- `package.json` automated merging (print-only in v0.1.2).
- Prompted fallback for token detection.
- Husky auto-install (seed-only).
- Reusable-workflow distribution.
- 3-way merge / versioned migrations.
- Helper action `cbartens/bkit/.github/actions/setup-auth@v1` (BAR-131 v0.2+).
- `--no-X` invert flags, `--force` to override Tier 3.
- `{{VERCEL_PROJECT_ID}}` / `{{LINEAR_TEAM_ID}}` token substitution (`app-gether-life`-specific).
- `claude.yml` / `ci-complete.yml` (BAR-120) / `smoke.yml` (project-specific).
- New CI workflows beyond `ci.yml`.

## Merge Method

**Squash.** Single PR `feat/bar-130-ci-lint-scaffolding` → `dev`. `bkit-ship.md` Step 3 hardcoded to `gh pr merge --squash --delete-branch --body ""`.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `parseArgs()` in `.agents/scripts/bkit-install.ts` (verb + `--host=` model) | `parseArgs()` (verb + module-flag model) — extracted to `.agents/scripts/bkit-cli.ts` | DELETE | Verb + `--host=` model collapses into composable flags; single source of arg parsing |
| **File:** `.agents/scripts/bkit-init.ts` (84 LOC, standalone) | Body migrates into `runCoreModule` in `.agents/scripts/bkit-modules.ts` | DELETE | File body (additive `.agents/` payload copy + `.bkit-version` write) migrates verbatim into `runCoreModule`. The deprecation stub for the `init` *verb* lives in `bkit-cli.ts` (separate row below) — NOT in this file. File deletion is safe. |
| **CLI verb:** `bkit init` | Inline `init` deprecation stub in `bkit-cli.ts` that prints warn + delegates to `install --full` | RETAIN-WITH-REASON | External contract — kept as deprecation stub through v0.1.x; removal kill-date **v0.2**; follow-up tracked in `docs/pending.md` against Linear issue **BAR-200** (or equivalent v0.2 parking-lot issue created/referenced in Task 9.2). |
| **CLI flag:** `--host=claude\|cursor` | `--claude` / `--cursor` module flags | RETAIN-WITH-REASON | External contract — deprecation stub through v0.1.x; removal kill-date **v0.2**; follow-up tracked in `docs/pending.md` against Linear issue **BAR-200** (or equivalent v0.2 parking-lot issue created/referenced in Task 9.2). |
| `runHost()` in `bkit-install.ts` (host-pass orchestrator) | Module functions in `bkit-modules.ts` (`runClaudeModule`, `runCursorModule`) | DELETE | Refactor — host-pass logic preserved verbatim, just relocated and split per module |
| `printUsage()` help string mentioning `init` + `--host=` | New help string with module-flag matrix + compose examples | DELETE | Old help is wrong post-CLI redesign |

> [!CAUTION]
> **`RETAIN-WITH-REASON` rows** for the `bkit init` verb + `--host=` flag carry an explicit kill-date (**v0.2**) and a follow-up Linear issue ID (**BAR-200**, created/referenced in Task 9.2) tracked in `docs/pending.md` per Supersession rules. The **file** `bkit-init.ts` is DELETE (body migrates to `runCoreModule`); the **verb** `init` is RETAIN-WITH-REASON (deprecation stub in `bkit-cli.ts`) — these are two distinct artifacts with two distinct decisions, resolving prior contradiction (Reviewer 1 #3 / Reviewer 2 C3).

## Security & Privacy

- [x] **New secret/env var** — `BKIT_READ_TOKEN` (consumer-side GitHub Actions secret, fine-grained PAT with `Contents: read` on `cbartens/bkit`). Documented in README `## Consumer CI auth`. Not stored anywhere bkit-side; consumer adds via GitHub Settings → Secrets.
- [x] **User input** — module flags parsed via allowlist in `parseArgs`; unknown flags hard-fail. No user-provided file paths (template paths are package-internal).
- [x] **PII** — none. Logs print file paths and write counts only.

_All other rows: N/A — no DB, no routes, no auth, no webhook, no notifications._

## 🚨 Pre-Flight / Dependencies 🚨

### Core (always verify)

- [ ] **Package Management:** `package.json` v0.1.1 — bump to `0.1.2` (final task). Add `prettier` devDep. `pnpm-lock.yaml` syncs cleanly post-add.
- [ ] **Dependency Versions:** Verify `pnpm --version` (≥ 10), `node --version` (≥ 20), `tsc --version` (≥ 5.4), `vale --version` if available locally (else CI-only).
- [ ] **User Context:** Verify read/write on `.agents/scripts/`, `.agents/templates/`, `.github/workflows/`, `.vale/styles/House/`, `package.json`, `README.md`, `.agents/README.md`.
- [ ] **Pending Blockers:** Query Linear for open issues with `blocker` label affecting bkit. (Expected: none — BAR-130 is itself the unblocker.)
- [ ] **Project Context:** No prior `docs/knowledge.md` / `docs/decisions.md` entries gate this work; both files will be appended (decisions for tier model + CLI surface; knowledge for any gotchas surfaced during build).
- [ ] **Testing & Quality:** Vitest configured; tests co-located as `*.test.ts` (unit) and `*.integration.test.ts` (integration). No new test infra needed.
- [ ] **Prerequisite Plans:** None. BAR-111 (extract) shipped at v0.1.1. BAR-130 stands alone.

### Conditional (verify only when applicable)

- [ ] **Architecture & UI:** N/A — CLI only.
- [ ] **Observability:** Bkit logs to stdout/stderr with `[bkit-install]` / `[bkit-check]` prefix; no log drains. Existing convention preserved.
- [ ] **Schema State:** N/A — no DB.
- [ ] **Secrets & Env Vars:** `BKIT_READ_TOKEN` is consumer-side only. No bkit-side secrets.
- [ ] **Notifications:** N/A.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** Human checked § Acceptance Scenario.
- [ ] **Breaking Changes confirmed:** Human checked § Breaking Changes.
- [ ] **Gate 1 - Verified:** All Core checked; applicable Conditional checked.

## Data Schema Integration

### Data Schema Usage (Inputs & Outputs)

None — bkit is a CLI tool, no database reads or writes.

### Data Schema Changes

None.

## Architecture & Component Changes

### Database Migrations

None.

### A. bkit-the-repo (self-gating PRs)

#### [NEW] `.github/workflows/ci.yml`

- Steps: actions/checkout → setup-node (`node-version: 20`) → pnpm/action-setup (`version: 10`) → `pnpm install --frozen-lockfile` → `pnpm typecheck` → `pnpm test` → `pnpm format:check` → install Vale (curl release tarball, mirror seed) → `pnpm lint:prose` → `pnpm lint:slop` → bkit self-test (`bun .agents/scripts/bkit-install.ts check`).
- Wraps the gates job in `# bkit:start` / `# bkit:end` markers (so future `bkit install --ci` on bkit itself round-trips correctly via dogfood).
- This is bkit's OWN gate workflow — does NOT contain the consumer auth-shim (bkit's own repo can clone itself without PAT).

#### [NEW] `.vale.ini`

- Scopes: `.agents/**` and root `*.md` only (drop app-specific scopes from seed). Styles: `write-good`, `House.LLMSlop`. Wrapped in `# bkit:start` / `# bkit:end` so dogfood `install --lint` round-trips.

#### [NEW] `.vale/styles/House/`

- Slop-detection rules. Tier 1 fully-managed (consumer never edits these directly).

#### [NEW] `slop-scan.config.json`

- Verbatim copy from seed. Tier 3 seed-or-print at consumer; for bkit-the-repo, plain checked-in file.

#### [NEW] `.prettierignore`

- `node_modules/`, `dist/`, `.agents/skills/`, `*.tsbuildinfo`. Wrapped in hash-comment markers.

#### [MODIFY] `package.json`

- **Existence Check:** `package.json` exists.
- Add scripts: `lint:prose`, `lint:slop`, `format:check`, `format`. Add devDep `prettier`. (Do NOT bump version yet — final task does that.)

### B. bkit-the-installer (three-tier write logic + tokens)

#### [NEW] `.agents/scripts/bkit-tokens.ts`

- Exports `resolveTokens(cwd: string): TokenMap` — reads `.nvmrc`, `package.json.engines.node`, `package.json.packageManager`, `package.json.name`, `git symbolic-ref refs/remotes/origin/HEAD`. Returns `{ NODE_VERSION, PNPM_VERSION, DEFAULT_BRANCH, PROJECT_NAME }` with documented fallbacks. Hard-fails on missing `package.json.name`.
- Exports `applyTokens(content: string, tokens: TokenMap): string` — substitutes `{{TOKEN}}` placeholders. Substitution happens at write-time, not read-time (per disambiguation 7).

#### [NEW] `.agents/scripts/bkit-tiers.ts`

- Exports three writers: `writeTier1(srcPath, destPath, tokens, dryRun)`, `writeTier2(srcPath, destPath, tokens, markerStyle, dryRun)`, `writeTier3(srcPath, destPath, dryRun, printSink)`.
- `markerStyle`: `"html-comment"` (markdown / `.gitignore`) or `"hash-comment"` (YAML / INI / shell). Markers re-use `findLineAnchoredMarkers` parser already in `bkit-install.ts`.
- Tier 1: idempotent rewrite of whole file (after token substitution).
- Tier 2: extend existing managed-block logic — generalised to take a `markerStyle` arg; format-specific marker emission.
- Tier 3: write-if-absent; if present, push suggested-diff to `printSink` and return `{ wrote: false, suggested: true }`.

#### [NEW] `.agents/scripts/bkit-modules.ts`

- Exports module functions: `runCoreModule`, `runClaudeModule`, `runCursorModule`, `runCiModule`, `runLintModule`, `runGitHooksModule`. Each takes `{ dryRun, tokens, modelLookup, printSink }`.
- Module registry: `MODULE_REGISTRY: Record<ModuleFlag, ModuleFn>`.
- `runCoreModule` always runs first; other modules call it implicitly.
- `runClaudeModule` / `runCursorModule` extract the existing `runHost()` logic (kept byte-equivalent for the host-pass behaviour).
- `runCiModule` writes `.github/workflows/ci.yml` (Tier 2 hash-comment markers) with auth-shim step inside the bkit block, all tokens substituted.
- `runLintModule` writes `.vale.ini` (Tier 2 hash-comment), `.vale/styles/House/**` (Tier 1), `slop-scan.config.json` (Tier 3), `.prettierignore` (Tier 2 hash-comment), and adds `package.json` script entries to print-sink.
- `runGitHooksModule` writes `.husky/pre-commit` and `.husky/pre-push` (Tier 2 hash-comment), and adds `prepare: "husky install"` to print-sink.

#### [NEW] `.agents/scripts/bkit-cli.ts`

- Exports `parseArgs(argv: string[]): { verb, modules, deprecations }`.
- Parses: `install` | `check` | `help` | `init` (deprecation alias for `install --full`); module flags allowlist; unknown flag → exit 1 with error.
- Deprecation handling: `init` verb sets `deprecations.init = true`, normalises to `install --full`. `--host=claude` sets `deprecations.host = "claude"`, normalises to `--claude`. Same for cursor. Stub prints warn ONCE before module dispatch.
- Exports `printUsage()` — new help string with module-flag matrix + compose examples (per BAR-130 § CLI surface).

#### [MODIFY] `.agents/scripts/bkit-install.ts`

- **Existence Check:** `.agents/scripts/bkit-install.ts` exists (verified).
- Refactor `main()` to: (1) call `parseArgs` from `bkit-cli.ts`, (2) emit deprecation warns, (3) call `resolveTokens` once, (4) dispatch through `MODULE_REGISTRY` per the parsed module set, (5) emit print-sink at end.
- Generalise `findLineAnchoredMarkers` and `updateManagedBlock` to accept a `markerStyle` arg (default `"html-comment"` for backward compat).
- Move `runHost` body into `runClaudeModule` / `runCursorModule` (in `bkit-modules.ts`); keep `runPayload` and `runTemplates` callable from `runCoreModule`.
- Fix dry-run parity bug (BAR-131 #3): in `runTemplates` rule 3a, the dry-run path must increment `writes++` and log identically to live install — already does for the template-write side, but write-set tracking now needs to flow through a shared `WriteSet` accumulator that both `check` and `install` populate identically.

#### [DELETE] `.agents/scripts/bkit-init.ts`

- **Reason:** `init` collapses to `install --full`. The 84-line file's logic (additive copy of `.agents/` payload from `PKG_AGENTS` to consumer `cwd`, `.bkit-version` write) folds into `runCoreModule` in `bkit-modules.ts`.
- Mirror in Supersession Inventory: tracked as RETAIN-WITH-REASON because the `init` verb itself remains as a CLI deprecation stub through v0.1.x — but the standalone `bkit-init.ts` file is DELETE because its body migrates into `bkit-modules.ts`.

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

#### [NEW] `.agents/templates/.claude/hooks/preflight.sh` (extend if exists)

- Tier 1 — already partially exists; verify and conform to seed.

### C. CLI redesign (composable module flags)

Covered by `bkit-cli.ts` + `bkit-modules.ts` above. Architecture wiring:

```
parseArgs(argv)
  → { verb, modules: Set<ModuleFlag>, deprecations }
  → if deprecations: print warn lines
  → resolveTokens(cwd) → tokens
  → for module in [core, ...modules]: MODULE_REGISTRY[module]({ dryRun, tokens, ... })
  → flush printSink (Tier 3 suggested diffs + first-run BKIT_READ_TOKEN block + package.json scripts)
```

### Cron Jobs & Scheduled Tasks

None.

## Documentation Updates

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `README.md` | Replace `## Then in the consumer repo` block (lines 40-48) with new `bkit install` + module-flag examples; add `## Consumer CI auth` § documenting `BKIT_READ_TOKEN` PAT setup; document `init` deprecation. |
| `.agents/README.md` | Replace `## Distribution` + `## Install / regenerate` (lines 114-167) to reflect new CLI surface; add `## Three-tier file ownership` § (Tier 1/2/3 semantics, marker variants); update `### What install writes` table with new template paths (`.github/workflows/ci.yml`, `.vale.ini`, `.husky/`, `slop-scan.config.json`, `.cursor/hooks.json`, `.cursor/settings.json`, `.prettierignore`). |
| `docs/decisions.md` | Append `DE-{N}: Three-tier file-ownership model for bkit installer` and `DE-{N+1}: Composable module-flag CLI surface (collapse init+install+--host)`. |
| `docs/knowledge.md` | None expected pre-build; append if gotchas surface during execution. |
| `docs/pending.md` | Append: `Helper auth action setup-auth@v1` (BAR-131 v0.2), `--no-X / --force flags` (v0.2), `package.json automated merging` (v0.2), `init verb removal` (v0.2 kill-date for deprecation stub), `--host= flag removal` (v0.2 kill-date). |
| `docs/completed.md` | Append entry on ship (NOT this plan's responsibility — `bkit-ship` workflow handles it). |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **Code** | `git revert {squash-commit}` on `dev`; consumers running v0.1.2 fall back to v0.1.1 by re-pinning. | Code-only — no DB. |
| **Tag** | `git tag -d v0.1.2 && git push --delete origin v0.1.2` if shipped tag must vanish. | Re-tag from a fix commit if going forward. |
| **Risk window** | None (no production deploy; library tag-and-go). | Consumers control upgrade cadence via pinned ref. |

_Code-only — `git revert` sufficient._

## Agent Execution Runbook

> [!IMPORTANT]
> Continuous execution. Each task: scope → acceptance → verification. Reproduce-first: failing test before code. Step Isolation: complete each task fully (incl. test pass + box check) before next.

### Phase 0 — Branch + scaffolding

- [ ] **Task 0.1 — Branch:** From worktree root, confirm branch is `feat/bar-130-ci-lint-scaffolding` (matches FID). `git status` clean except this plan.
  - **Verification:** `git rev-parse --abbrev-ref HEAD` outputs `feat/bar-130-ci-lint-scaffolding`.
- [ ] **Task 0.2 — Scaffold empty test files (Reproduce-first stubs):** Create `bkit-tokens.test.ts`, `bkit-tiers.test.ts`, `bkit-cli.test.ts`, `bkit-modules.integration.test.ts`, `bkit-dry-run-parity.integration.test.ts` in `.agents/scripts/`. Each with one `it.todo("…")` per Derived Test Matrix row targeting that file.
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

- [ ] **Task 2.1a — Failing tests for hash-comment marker round-trip (Test Matrix row: hash-comment YAML/INI/shell — Auditor 1 CRITICAL #1):** Extend `bkit-install.test.ts` with cases asserting `findLineAnchoredMarkers` recognises hash-comment marker literal `# bkit:start` / `# bkit:end` and round-trips on YAML/INI/shell content. **Concrete marker string literals (Reviewer 2 C6):**
  - `markerStyle: "hash-comment"` → `START = "# bkit:start"`, `END = "# bkit:end"` (NEW — line-anchored, no surrounding whitespace required for match).
  - **Acceptance:** test asserts `extractManagedBlock` + `updateManagedBlock` round-trip with `markerStyle: "hash-comment"` byte-identically on (i) YAML, (ii) INI, (iii) shell content. Three distinct fixture cases.
  - **Verification:** New hash-comment tests red; existing html-comment tests still green.
- [ ] **Task 2.1b — Failing tests for html-comment round-trip + default-arg backward-compat (Test Matrix row: html-comment markdown/.gitignore — Auditor 1 CRITICAL #1):** Extend `bkit-install.test.ts` with cases asserting:
  - `markerStyle: "html-comment"` → `START = "<!-- bkit:start -->"`, `END = "<!-- bkit:end -->"` (existing constants — preserve).
  - **Acceptance:** test asserts (a) html-marker round-trip on markdown content, (b) html-marker round-trip on `.gitignore` content, (c) calling existing API without `markerStyle` arg defaults to `"html-comment"` and produces byte-identical output to v0.1.1 (backward-compat regression).
  - **Verification:** New default-arg backward-compat test red; existing html-comment regression tests still green.
- [ ] **Task 2.2 — Generalise marker parser + update all call sites:** Modify the four exported functions in `.agents/scripts/bkit-install.ts` to take an optional `markerStyle: "html-comment" | "hash-comment"` arg (default `"html-comment"` for backward compat — Reviewer 2 C2). The four functions and their internal couplings:
  - `findLineAnchoredMarkers(content, markerStyle?)` — switches on `markerStyle` to select between `(START_MARKER, END_MARKER)` html-pair and `(HASH_START_MARKER, HASH_END_MARKER)` hash-pair.
  - `extractManagedBlock(content, markerStyle?)` — passes `markerStyle` through to `findLineAnchoredMarkers`.
  - `extractFullManagedBlock(content, markerStyle?)` — **also calls `findLineAnchoredMarkers` internally** (currently uses hardcoded `START_MARKER` / `END_MARKER`); update internal call to forward `markerStyle`.
  - `updateManagedBlock(filePath, newContent, dryRun, markerStyle?)` — adds 4th arg; emits the matching marker pair on write.
  - **Call-site audit (must update or confirm safe-default):** all references to these four functions in `bkit-install.ts` (current `main()` / `runTemplates` / `runHost`), in `bkit-install.test.ts`, and in any new module file (`bkit-modules.ts`, `bkit-tiers.ts`). Run `grep -nE 'findLineAnchoredMarkers|updateManagedBlock|extractManagedBlock|extractFullManagedBlock' .agents/` and update every site that needs hash-comment behaviour; sites that omit the arg get the html-comment default unchanged.
  - **Acceptance:** Tasks 2.1a + 2.1b tests pass; original tests still green; backward-compat regression test (default arg behaviour) green.
  - **Verification:** `pnpm test bkit-install` green; `pnpm typecheck` green; `grep` audit produces zero unexplained mismatches.
- [ ] **Task 2.3 — Failing tests for tier writers:** In `bkit-tiers.test.ts`, write tests for Tier 1 (idempotent rewrite), Tier 2 (managed-block append on existing file with consumer content above), Tier 3 (write-if-absent + suggested-diff to printSink). Cover hash-comment AND html-comment marker styles per tier.
  - **Verification:** Tests red.
- [ ] **Task 2.4 — Implement `bkit-tiers.ts`:** Create `.agents/scripts/bkit-tiers.ts` with `writeTier1`, `writeTier2`, `writeTier3`. Reuse `runTemplates` rule logic where possible; factor out from `bkit-install.ts`.
  - **Acceptance:** Task 2.3 tests pass.
  - **Verification:** `pnpm test bkit-tiers` green.

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
    - **Preferred:** Delete the guard entirely. `runCoreModule` is responsible for ensuring `.agents/prompts.md` exists (via additive payload copy from `PKG_AGENTS`). Any module that depends on `prompts.md` runs *after* `runCoreModule`.
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
  - Asserts the order of writes by inspecting a synthetic write-log: `.agents/` payload copies happen first, then `rules.md` block update, then `.gitignore` block update, then **finally** `.bkit-version`. (Test the contract via the WriteSet accumulator from Phase 5, or by hooking `fs.writeFileSync` and recording call order, or by inspecting a list of paths returned from `runCoreModule`.)
  - Assert that if any earlier write throws (mocked failure), `.bkit-version` is NOT written.
  - **Sub-step (Auditor 2 CRITICAL C4 — `runHost` DELETE verification):** After Task 4.2 migrates `runHost` body into `runClaudeModule`/`runCursorModule`, add a grep-based dead-code verification: `grep -n 'runHost' .agents/scripts/bkit-install.ts` MUST return zero hits (no `function runHost`, no exported `runHost`, no internal calls). Mirror check: `grep -nE 'runHost\b' .agents/scripts/` may only return hits in `.test.ts` history-removal contexts or in `bkit-modules.ts` import-renames; document any non-zero hit inline with rationale. Acceptance is binary: `grep -c 'runHost' .agents/scripts/bkit-install.ts` = 0.
  - **Verification:** Test green; `grep -n 'runHost' .agents/scripts/bkit-install.ts` returns no matches; `pnpm build` succeeds with no dead `runHost` export.
- [ ] **Task 4.6 — `.bkit-version` first-run signal extra-logging test (Auditor 2 CRITICAL C3 — closes orphaned Test Matrix row):** Add a test in `bkit-modules.integration.test.ts` asserting that the print-sink emits the BKIT_READ_TOKEN setup block + `package.json` script entries ONLY on first install (when `.bkit-version` is absent in the tmpdir at start) and is SUPPRESSED on the idempotent second run (when `.bkit-version` already exists at the version being installed).
  - **Setup:** tmpdir without `.bkit-version`; capture print-sink during `runFull` (or `runCoreModule` + relevant modules); assert print-sink contains `BKIT_READ_TOKEN` substring AND a `package.json` script-entry suggestion (e.g., `"lint:prose"`).
  - **Second run:** call again with `.bkit-version` now present at `0.1.2`; capture print-sink; assert print-sink does NOT contain `BKIT_READ_TOKEN` substring AND does NOT contain the `package.json` script-entry suggestion (extra-logging suppressed because `.bkit-version` signals consumer is already onboarded).
  - **Acceptance:** both assertions green; the binary signal `.bkit-version absent → emit; present → suppress` is enforced.
  - **Verification:** `pnpm test bkit-modules` green; matrix row "`.bkit-version` first-run signal triggers extra logging (BKIT_READ_TOKEN setup, package.json scripts)" mapped to this task.

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
  - **Verification:** All green.

### Phase 6 — Templates payload (B + A)

- [ ] **Task 6.1 — Add `.agents/templates/.github/workflows/ci.yml` (Tier 2):** Bkit-managed block only, with `# bkit:start` / `# bkit:end` markers. Job `bkit-gates`: setup-node `{{NODE_VERSION}}`, pnpm `{{PNPM_VERSION}}`, auth-shim, `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm test`, `pnpm format:check`, `pnpm lint:prose`, `pnpm lint:slop`, `bkit check`. `on: pull_request: branches: [{{DEFAULT_BRANCH}}]`.
  - **Acceptance (Auditor 1 CRITICAL #2 — DoD bullet 12 auth-shim assertion):** Add an automated test in `bkit-install.test.ts` (matrix row "Token-substituted `ci.yml` template renders auth-shim step inside bkit block") that loads the rendered template after `applyTokens` and asserts the auth-shim line `git config --global url."https://x-access-token:${{ secrets.BKIT_READ_TOKEN }}@github.com/"` appears LITERALLY between the `# bkit:start` and `# bkit:end` markers (extract managed block, then `expect(block).toContain('BKIT_READ_TOKEN')` AND `expect(block).toContain('git config --global url.')`). Test must also assert the auth-shim step appears BEFORE the `pnpm install --frozen-lockfile` step (line index of shim < line index of install).
  - **Verification:** Run `bkit install --ci` against tmpdir with existing `ci.yml` containing 2 consumer jobs → bkit block appended; consumer jobs preserved; `pnpm test bkit-install` green including the new auth-shim-inside-block assertion.
- [ ] **Task 6.1b — Integration test: substituted `ci.yml` end-to-end (Auditor 1 CRITICAL #3 — DoD bullet 9):** In `bkit-modules.integration.test.ts` add a test that asserts the integrated path (`resolveTokens` → `applyTokens` → Tier 2 write → final on-disk `ci.yml` content) substitutes Node/pnpm/branch values:
  - **Setup:** tmpdir pre-seeded with `.nvmrc: 22\n`, `package.json` `{"name":"x","packageManager":"pnpm@10.4.1"}`, `git init` with default branch `main`.
  - **Acceptance:** after `runCiModule` (or `runFull`) executes, `fs.readFileSync(".github/workflows/ci.yml","utf8")` contains literal substrings: `node-version: 22`, `branches: [main]`, and the pnpm major version `10` (e.g., `version: 10` in pnpm/action-setup step). No `{{NODE_VERSION}}` / `{{PNPM_VERSION}}` / `{{DEFAULT_BRANCH}}` placeholders remain in the on-disk file.
  - **Verification:** `pnpm test bkit-modules` green; integration assertion fails if any token substitution path regresses.
- [ ] **Task 6.2 — Add `.agents/templates/.vale.ini` (Tier 2 hash-comment) + `.agents/templates/.vale/styles/House/**` (Tier 1):** Slim seed to `.agents/**` + root `*.md` scopes only.
  - **Verification:** `bkit install --lint` writes both; rerun = no-op.
- [ ] **Task 6.3 — Add `.agents/templates/slop-scan.config.json` (Tier 3):** Verbatim from seed.
  - **Verification:** Existing consumer file → suggested-diff to stdout; absent → file written.
- [ ] **Task 6.4 — Add `.agents/templates/.prettierignore` (Tier 2 hash-comment):** Standard ignore list.
  - **Verification:** Append-block on existing file; whole file write on greenfield.
- [ ] **Task 6.5 — Add `.agents/templates/.husky/pre-commit` + `pre-push` (Tier 2 hash-comment):** `pre-commit` runs `pnpm lint:prose && pnpm lint:slop`; `pre-push` runs `pnpm typecheck && pnpm test`. Set executable bit.
  - **Verification:** `bkit install --git-hooks` seeds files with `0o755` mode; print-sink contains `prepare: husky install` script entry.
- [ ] **Task 6.6 — Add `.agents/templates/.cursor/hooks.json` (Tier 1) + `.cursor/settings.json` (Tier 3):** Mirror seed wiring (sessionStart/stop hooks; plugin allowlist).
  - **Verification:** `bkit install --cursor` rewrites `hooks.json` every run; `settings.json` written if absent or printed if present.

### Phase 7 — Self-gating (A): bkit's own CI + lint config

- [ ] **Task 7.1 — Add `.github/workflows/ci.yml` to bkit:** New file (NOT a template — bkit's own gates). Steps: checkout, setup-node 20, pnpm 10, install, typecheck, test, format:check, install Vale, lint:prose, lint:slop, bkit self-test. Wrap in `# bkit:start` / `# bkit:end` for dogfood round-trip.
  - **Self-test runtime decision (Reviewer 1 #2):** `bun` is NOT pre-installed on `ubuntu-latest`. Two acceptable patterns — pick ONE explicitly:
    - **Option A (preferred):** Use `pnpm tsx` — no extra setup step, leverages existing pnpm runtime. Step: `run: pnpm tsx .agents/scripts/bkit-install.ts check`. Requires `tsx` in devDeps (already present per `package.json` — verify; if absent, add as part of this task).
    - **Option B:** Add `oven-sh/setup-bun@v2` step before the self-test, then `run: bun .agents/scripts/bkit-install.ts check`. Adds ~3s install step.
    - **Decision:** plan adopts **Option A** (`pnpm tsx`) for parity with how local devs run scripts and to avoid adding a runtime to the CI job.
  - **Package distribution check (Reviewer 2 C7):** `.github/workflows/ci.yml` (this file, at bkit-the-repo root) must be excluded from the npm/git-dep package shipped to consumers. The `package.json` `"files"` array (currently `["dist", ".agents", "README.md"]`) does NOT include `.github/`, so this file is correctly excluded by default. **Verification (no code change):** Run `pnpm pack --dry-run` (or `npm pack --dry-run`) and confirm `.github/workflows/ci.yml` is NOT in the packed file list. Document the result in the task acceptance log. (The consumer-facing CI workflow is the *template* at `.agents/templates/.github/workflows/ci.yml` — that one ships, this one does not.)
  - **Verification:** Push branch → CI runs → all gates pass on this PR; `pnpm pack --dry-run` confirms `.github/` excluded from package distribution.
- [ ] **Task 7.2 — Add `.vale.ini` + `.vale/styles/House/` to bkit:** Same content as templates; ensure dogfood `bkit install --lint` is a no-op (already in sync).
  - **Verification:** `pnpm lint:prose` runs locally (with Vale installed) without error.
- [ ] **Task 7.3 — Add `slop-scan.config.json` + `.prettierignore` to bkit:** Same content as templates.
  - **Verification:** `pnpm lint:slop` and `pnpm format:check` run clean.
- [ ] **Task 7.4 — Add `prettier` devDep + `package.json` lint scripts:** Edit `package.json` — add `prettier` to devDeps; add scripts:
  - `format: "prettier --write ."`
  - `format:check: "prettier --check ."`
  - `lint:slop: "node ./node_modules/.bin/slop-scan ..."` (verbatim per seed config).
  - `lint:prose` — **two-stage guard (Reviewer 1 #6 + Reviewer 2 O6):** the v1 wording (`vale .agents/ *.md || (echo skip && exit 0)`) swallowed real Vale findings. Replace with an explicit `command -v vale` test that ONLY masks the binary-missing case; real findings still propagate. Use one of:
    - `lint:prose: "command -v vale >/dev/null 2>&1 && vale .agents/ '*.md' || echo '[bkit] vale not in PATH — skipping'"` — quote the glob to defer expansion to vale itself; only the *missing-binary* arm reaches the `echo` (after the `||`); when vale is present and exits non-zero on real findings, the script returns vale's non-zero exit because the `&&` short-circuits and the `||` is never evaluated. (Caveat: this still falls through to the `||` on real findings — see alternative below.)
    - **Preferred alternative:** split the guard into a small bash wrapper to make findings vs missing-binary unambiguous: `lint:prose: "bash -c 'if command -v vale >/dev/null 2>&1; then vale .agents/ \"*.md\"; else echo \"[bkit] vale not in PATH — skipping\"; fi'"`. Real Vale findings yield Vale's non-zero exit; missing binary yields exit 0.
    - **Decision:** adopt the **preferred alternative** (bash-wrapped if/else). Quote the `*.md` glob so it is forwarded literally to Vale (which globs internally); avoids zsh-vs-bash mis-glob across macOS/Linux.
  - Run `pnpm install` to lockfile-sync.
  - **Verification:** `pnpm format:check` green; `pnpm lint:prose` green (or graceful warn if Vale missing); commit lockfile changes.

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

- [ ] **Gate 2 - Verified:** Every task above checked off and independently verified.

> [!IMPORTANT]
> **Testing Strategy:** Vitest unit (`*.test.ts`) and integration (`*.integration.test.ts`) co-located with source under `.agents/scripts/`. No Playwright (no UI). No DB integration tests. Mocking strategy: real fs against `os.tmpdir()` + `process.chdir` (existing pattern in `bkit-install.test.ts`); no fs mocks except where explicitly testing dry-run write-set tracking.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Cross-check every Test Matrix row against a runbook task — all 21 rows mapped.
- [ ] **Audit `it.todo` promotion (Auditor 1 CRITICAL #4 — closes Phase 0.2 stub loophole):** Run `grep -nE "it\.todo|test\.todo" .agents/scripts/bkit-tokens.test.ts .agents/scripts/bkit-tiers.test.ts .agents/scripts/bkit-cli.test.ts .agents/scripts/bkit-modules.integration.test.ts .agents/scripts/bkit-dry-run-parity.integration.test.ts` and assert ZERO hits. Every `it.todo()` placeholder seeded in Task 0.2 MUST have been promoted to a real `it()` (red-then-green) before Gate 2 closes. If the grep returns any line, Gate 3 cannot close until the offending todos are either promoted or explicitly justified inline (with a documented Linear follow-up reference) and the justification logged in `docs/knowledge.md`.
- [ ] **Update existing tests:** Existing `bkit-install.test.ts` tests updated for marker-style generalisation (Task 2.2). All other existing tests (T1/T2/T3 transforms, parseModelLookup, runTemplates) remain unchanged.
- [ ] **Write new tests:** Five new test files created (Tasks 0.2, then filled in 1.1, 2.3, 3.1, 4.1, 5.1).
- [ ] **Verify observability:** Bkit logs `[bkit-install]` / `[bkit-check]` prefix preserved across all module dispatches; deprecation warns use `[bkit] DEPRECATED:` prefix consistently. No PII; no log drains.
- [ ] **Update documentation:** `README.md`, `.agents/README.md`, `docs/decisions.md`, `docs/pending.md` updated per Phase 8/9.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** All Documentation Updates rows completed.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

## Verification Plan

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm typecheck` (`tsc --noEmit`) green; `pnpm format:check` green.
- [ ] **Unit + Integration:** `pnpm test` runs all `*.test.ts` + `*.integration.test.ts`. Expected pass count: existing tests + ~33 new (Token resolver ~6, Tiers ~6, CLI ~7, Modules ~6 incl. first-run extra-logging from Task 4.6 + substituted `ci.yml` integration from Task 6.1b, Dry-run parity ~7, plus the split hash/html marker tests from Tasks 2.1a/2.1b).
- [ ] **Build:** `pnpm build` (`tsc`) emits `dist/bkit-install.js`, `dist/bkit-tokens.js`, `dist/bkit-tiers.js`, `dist/bkit-cli.js`, `dist/bkit-modules.js`. No `dist/bkit-init.js` (file deleted).
- [ ] **Self-test:** `pnpm tsx .agents/scripts/bkit-install.ts check` exits 0 (bkit-the-repo is in sync with its own templates after Phase 7). (Reviewer 1 #2 — switched from `bun` to `pnpm tsx` for CI runner parity.)
- [ ] **CI on PR:** `.github/workflows/ci.yml` runs all gates green on the PR for this branch (auth-shim NOT needed for bkit's own repo since CI clones itself).

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
- [ ] **Step 7 — `app-gether-life` smoke-install (DoD bullet 13):** Per Task 10.3 — local `pnpm link` + `bkit install --full`; consumer's CI runs green on next PR after `BKIT_READ_TOKEN` is configured. **MUST be confirmed before merge** via the Gate 4.5 checkbox below.
- [ ] **Step 8 — Second consumer onboarding (DoD bullet 14):** `www-visitfrasercoast-com` (or other) runs `bkit install --full` (replacing `bkit init`); CI green on first run after secret + allowlist setup. **Separate human session — not auto.** Confirmed via Gate 4.5 checkbox below.

### 🔒 Gate 4.5: Manual Smoke Confirmation (DoD bullets 13 + 14) — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 Reviewer 2 C4 — this gate blocks merge.** DoD bullets 13 and 14 (`app-gether-life` re-install + second-consumer onboarding) are NOT covered by automated verification (Gate 4). Without this gate, the build agent could mark Gate 4 passed and open the PR while bullets 13/14 are still open. **Plan does NOT pass until both checkboxes below are checked by a human (or `bkit-build` agent acting on confirmed artefacts).**

- [ ] **Gate 4.5a — `app-gether-life` smoke confirmed (DoD bullet 13):** Manual smoke-install log committed to `docs/plans/logs/bar-130-ci-lint-scaffolding/smoke-install.md` per Task 10.3; `app-gether-life` CI green on first PR post-upgrade. Human reviewer signs the log entry with timestamp + `git diff` summary.
- [ ] **Gate 4.5b — Second consumer confirmed (DoD bullet 14):** `www-visitfrasercoast-com` (or other) onboarding completed by human; CI green on first run after secret + allowlist setup. Log entry appended to `docs/plans/logs/bar-130-ci-lint-scaffolding/smoke-install.md` (or a sibling `second-consumer.md`).
- [ ] **Gate 4.5 - Verified:** Both 4.5a + 4.5b checked; merge unblocked.
