# BAR-130 v4-1 — bkit-the-repo Self-Gating (Scope A) Implementation Plan

**Parent Plan:** [`bar-130-ci-lint-scaffolding-plan.md`](./bar-130-ci-lint-scaffolding-plan.md)
**Master full plan (v3 — checked):** [`plan-v3-checked.md`](./plan-v3-checked.md)
**Sibling order:** v4-1 (this) → v4-2 → v4-3.
**Prerequisites:** None (this child runs first).

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this `bar-130-ci-lint-scaffolding-plan-1.md` natively via `Read` _before_ executing any steps.
> 2. NEVER trust system summaries or prior conversation to determine what is done.
> 3. Source of truth: literal `[x]` vs `[ ]` checkboxes below.

## Context & Goals

bkit `v0.1.1` extracted only the agent-orchestration core and shipped zero CI/lint discipline for **bkit's own repo**. This child closes that gap: bkit dogfoods its own discipline so every bkit PR runs the same gates it ships to consumers.

**Scope of this child:** Add `.github/workflows/ci.yml`, `.vale.ini`, `.vale/styles/House/`, `slop-scan.config.json`, `.prettierignore` to bkit-the-repo. Add `prettier` devDep + `lint:prose` / `lint:slop` / `format:check` / `format` scripts to bkit's `package.json`. Wrap the CI workflow in `# bkit:start` / `# bkit:end` markers so future dogfood `bkit install --ci` round-trips on bkit itself.

**Out of scope here (deferred to v4-2 / v4-3):** consumer-facing template payloads, installer engine, CLI redesign, version bump.

**Success Criteria (this child):**

- bkit's own PRs run typecheck + vitest + Vale + slop-scan + self-test + format:check (DoD bullet 1).
- `pnpm format:check` and `pnpm lint:slop` exit clean on bkit's existing source.
- `pnpm lint:prose` runs (or skips gracefully if Vale binary absent in PATH).
- `pnpm pack --dry-run` confirms `.github/` is NOT shipped to consumers (only the consumer-facing template under `.agents/templates/.github/workflows/ci.yml` ships — but that template lives in v4-2 scope).

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract. Inherited verbatim from the master plan; Concrete Example below is the v4-1 specialisation.

### Narrative _(inherited from master)_

A consumer adds `@cbartens/bkit@v0.1.2` to their repo, runs `bkit install --full` once on a non-empty project, and gets a complete, idempotent agent + CI + lint + git-hooks stack — bkit-managed blocks injected without clobbering existing files, tokens substituted from project state, dry-run/install parity preserved, and the private-repo CI auth-shim seeded so first PR CI passes.

### Success Criteria _(inherited from master, full set; this child closes only #5 below)_

1. `bkit install` (no flags ≡ `--full`) on empty repo seeds files across all three tiers.
2. Selective module install seeds only the requested modules + `--core`.
3. `bkit install --ci` on existing customised `ci.yml` injects bkit-managed block w/ substituted tokens.
4. `bkit check --full` writeset equals `bkit install --full` writeset.
5. **bkit's own PRs run typecheck + vitest + Vale + slop-scan + self-test before merge** ← THIS CHILD.

### Concrete Example _(v4-1 specialisation — bkit dogfoods its own gates)_

**Setup:** Maintainer of bkit on branch `feat/bar-130-ci-lint-scaffolding`. Bkit currently has only `build`, `test`, `typecheck`, `prepare` scripts in `package.json`. No `.github/workflows/`, no `.vale*`, no `slop-scan.config.json`, no `.prettierignore`, no `prettier` devDep.

**Steps:**

1. Maintainer adds `.github/workflows/ci.yml` (Task 7.1) → push branch → GitHub Actions runs the `bkit-gates` job (checkout + setup-node 20 + pnpm 10 + install + typecheck + test + format:check + Vale install + lint:prose + lint:slop + bkit self-test via `pnpm tsx`). All steps green.
2. Maintainer adds `.vale.ini` + `.vale/styles/House/` (Task 7.2) → `pnpm lint:prose` runs locally (with Vale installed) without error.
3. Maintainer adds `slop-scan.config.json` + `.prettierignore` (Task 7.3) → `pnpm lint:slop` and `pnpm format:check` run clean.
4. Maintainer edits `package.json` (Task 7.4): adds `prettier` devDep + `lint:prose` / `lint:slop` / `format:check` / `format` scripts → `pnpm install` lockfile-syncs.
5. Maintainer runs `pnpm pack --dry-run` → confirms `.github/` absent from packed file list.

**Outcome:** Bkit's own PRs gate themselves. The lint/format scripts that v4-2 and v4-3 verification will rely on (`pnpm format:check`, `pnpm lint:prose`, `pnpm lint:slop`) now exist.

### Edge Cases _(filtered from master to v4-1's surface)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Vale binary not in `$PATH` on dev machine | `lint:prose` script skips gracefully with `[bkit] vale not in PATH — skipping`; CI workflow installs Vale itself so CI does not skip |
| `pnpm pack --dry-run` lists `.github/` | FAIL — `.github/` MUST be excluded by the existing `package.json` `"files"` array (`["dist", ".agents", "README.md"]`) |

### Derived Test Matrix _(v4-1 subset)_

> v4-1 has no new unit/integration tests — its acceptance is via the CI workflow itself running and the pre-PR gate sequence below.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| `pnpm format:check` exits 0 against bkit's existing source | Pre-PR gate | (CLI invocation, no test file) |
| `pnpm lint:slop` exits 0 against bkit's existing source | Pre-PR gate | (CLI invocation) |
| `pnpm lint:prose` exits 0 (or graceful skip if Vale absent) | Pre-PR gate | (CLI invocation) |
| `.github/workflows/ci.yml` CI run is green on the PR for this branch | CI gate | (GitHub Actions, no local test file) |
| `pnpm pack --dry-run` excludes `.github/` from packed list | Pre-PR gate | (CLI invocation) |

### 👤 ✅ Human Confirmation

- [x] **Acceptance Scenario confirmed:** Narrative, Success Criteria, Concrete Example, Edge Cases, Derived Test Matrix correctly describe done for v4-1.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until checked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

### Breaking Changes (v4-1)

None within v4-1's scope. v4-1 is purely additive — adds files and `package.json` script entries; no existing scripts changed; no API surface affected.

### New Naming (v4-1)

- New scripts in `bkit/package.json`: `lint:prose`, `lint:slop`, `format:check`, `format`.
- New devDep: `prettier`.
- New files at bkit-the-repo root: `.github/workflows/ci.yml`, `.vale.ini`, `.vale/styles/House/**`, `slop-scan.config.json`, `.prettierignore`.

### DB / API / Routes

None — bkit is a CLI tool, no database, no routes, no API contracts.

### 👤 ✅ Human Confirmation

- [x] **Breaking Changes confirmed.**

---

## Alternative Approaches & Recommendations

**Self-test runtime decision (per master Reviewer 1 #2):** `bun` is NOT pre-installed on `ubuntu-latest`. v4-1 adopts **`pnpm tsx`** — no extra setup step, leverages existing pnpm runtime. Step: `run: pnpm tsx .agents/scripts/bkit-install.ts check`. Requires `tsx` in devDeps (already present per `package.json` — verify in Task 7.1; if absent, add as part of that task).

**`lint:prose` two-stage guard (per master Reviewer 1 #6 + Reviewer 2 O6):** uses bash-wrapped if/else so real Vale findings yield Vale's non-zero exit; missing-binary case yields exit 0. Verbatim:

```
lint:prose: "bash -c 'if command -v vale >/dev/null 2>&1; then vale .agents/ \"*.md\"; else echo \"[bkit] vale not in PATH — skipping\"; fi'"
```

## Out of Scope (v4-1)

- Consumer-facing template payloads (`.agents/templates/.github/workflows/ci.yml`, `.agents/templates/.vale.ini`, etc.) — v4-2 owns these.
- Installer engine (token resolver, tier writers) — v4-2.
- CLI redesign (`bkit-cli.ts`, `bkit-modules.ts`) — v4-3.
- Version bump to `0.1.2` — v4-3 Task 10.1.
- README + `.agents/README.md` rewrites — v4-3 Tasks 8.1, 8.2.
- `docs/decisions.md` / `docs/pending.md` appends — v4-3 Tasks 9.1, 9.2.

## Merge Method

**Squash.** Single PR `feat/bar-130-ci-lint-scaffolding` → `dev` (shared with siblings v4-2 and v4-3 if executed in one branch; if children are split into separate PRs, each is squashed independently).

## Supersession Inventory

None within v4-1's scope. (All six master supersession rows touch CLI surfaces owned by v4-3 — see `bar-130-ci-lint-scaffolding-plan.md` Cross-cutting: Supersession Inventory Distribution.)

## Security & Privacy

- [x] **User input** — none. v4-1 only adds local config files + `package.json` script entries.
- [x] **PII** — none.

_All other rows: N/A — no DB, no routes, no auth, no webhook, no notifications, no new secret/env var (the `BKIT_READ_TOKEN` lives in v4-2 templates + v4-3 README)._

## 🚨 Pre-Flight / Dependencies 🚨

### Core (always verify)

- [x] **Package Management:** `package.json` v0.1.1 — DO NOT bump version here (v4-3 owns Task 10.1). Add `prettier` devDep. `pnpm-lock.yaml` syncs cleanly post-add.
- [x] **Dependency Versions:** Verify `pnpm --version` (≥ 10), `node --version` (≥ 20), `tsc --version` (≥ 5.4), `vale --version` if available locally (else CI-only). Verify `tsx` devDep is present (else add in Task 7.1).
- [x] **User Context:** Verify read/write on `.github/workflows/`, `.vale/styles/House/`, `slop-scan.config.json`, `.prettierignore`, `package.json`, `pnpm-lock.yaml`.
- [x] **Pending Blockers:** Query Linear for open issues with `blocker` label affecting bkit. (Expected: none.)
- [x] **Project Context:** No prior `docs/knowledge.md` / `docs/decisions.md` entries gate this work.
- [x] **Testing & Quality:** v4-1 adds no test files. Acceptance via pre-PR gate sequence + GitHub Actions CI green.
- [x] **Prerequisite Plans:** None. v4-1 stands alone and runs first.

### Conditional

- [x] **Architecture & UI:** N/A — CLI tool only.
- [x] **Observability:** v4-1's CI workflow logs to GitHub Actions stdout; no log drains.

### 🔒 Gate 1: Prerequisites Check

- [x] **Acceptance Scenario confirmed.**
- [x] **Breaking Changes confirmed.**
- [x] **Gate 1 - Verified:** All Core checked; applicable Conditional checked.

## Data Schema Integration

None — bkit is a CLI tool.

## Architecture & Component Changes

### A. bkit-the-repo (self-gating PRs)

#### [NEW] `.github/workflows/ci.yml` (bkit's own CI — NOT a template)

- Steps: `actions/checkout` → `actions/setup-node@v4` (`node-version: 20`) → `pnpm/action-setup` (`version: 10`) → `pnpm install --frozen-lockfile` → `pnpm typecheck` → `pnpm test` → `pnpm format:check` → install Vale (curl release tarball, mirror seed) → `pnpm lint:prose` → `pnpm lint:slop` → bkit self-test (`pnpm tsx .agents/scripts/bkit-install.ts check`).
- Wraps the gates job in `# bkit:start` / `# bkit:end` markers (so future `bkit install --ci` on bkit itself round-trips correctly via dogfood — that round-trip is exercised in v4-3, but the markers must be present from v4-1 onward).
- This is bkit's OWN gate workflow — does NOT contain the consumer auth-shim (bkit's own repo can clone itself without PAT).
- Excluded from npm/git-dep package by existing `package.json` `"files": ["dist", ".agents", "README.md"]` allowlist.

#### [NEW] `.vale.ini`

- Scopes: `.agents/**` and root `*.md` only (drop app-specific scopes from seed). Styles: `write-good`, `House.LLMSlop`. Wrapped in `# bkit:start` / `# bkit:end` so dogfood `install --lint` round-trips (round-trip exercised in v4-3).

#### [NEW] `.vale/styles/House/`

- Slop-detection rules. Tier 1 fully-managed (consumer never edits these directly). v4-1 ships these as plain checked-in files at bkit-the-repo root; v4-2 ships the same content again under `.agents/templates/.vale/styles/House/`.

#### [NEW] `slop-scan.config.json`

- Verbatim copy from seed. For bkit-the-repo, plain checked-in file.

#### [NEW] `.prettierignore`

- `node_modules/`, `dist/`, `.agents/skills/`, `*.tsbuildinfo`. Wrapped in hash-comment markers.

#### [MODIFY] `package.json`

- **Existence Check:** `package.json` exists at repo root (verified pre-flight).
- Add scripts: `lint:prose`, `lint:slop`, `format:check`, `format`. Add devDep `prettier`. **Do NOT bump version yet** — v4-3 Task 10.1 owns the bump.

### Database Migrations

None.

### Cron Jobs & Scheduled Tasks

None.

## Documentation Updates

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `docs/decisions.md` | None within v4-1. (v4-3 Task 9.1 appends the two BAR-130 ADRs.) |
| `docs/knowledge.md` | None expected; append if gotchas surface during execution. |

_All other doc rows: untouched in v4-1 — see v4-3 for README + `.agents/README.md` rewrites and `docs/pending.md` appends._

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **Code** | `git revert {squash-commit}` on `dev`. | Code-only — no DB. v4-1 is purely additive; revert removes `.github/`, `.vale*`, `slop-scan.config.json`, `.prettierignore`, prettier devDep, lint scripts. |
| **Risk window** | None (no production deploy; bkit is library tag-and-go). | Consumer impact zero — these files do not ship to consumers (the consumer-facing equivalents live in `.agents/templates/`, owned by v4-2). |

## Agent Execution Runbook

> [!IMPORTANT]
> Continuous execution. Each task: scope → acceptance → verification. Step Isolation: complete each task fully (incl. test pass + box check) before next.

### Phase 7 — Self-gating (A): bkit's own CI + lint config

- [x] **Task 7.1 — Add `.github/workflows/ci.yml` to bkit:** New file (NOT a template — bkit's own gates). Steps: checkout, setup-node 20, pnpm 10, install, typecheck, test, format:check, install Vale, lint:prose, lint:slop, bkit self-test. Wrap in `# bkit:start` / `# bkit:end` for dogfood round-trip.
  - **Self-test runtime decision (Reviewer 1 #2):** `bun` is NOT pre-installed on `ubuntu-latest`. Two acceptable patterns — pick ONE explicitly:
    - **Option A (preferred):** Use `pnpm tsx` — no extra setup step, leverages existing pnpm runtime. Step: `run: pnpm tsx .agents/scripts/bkit-install.ts check`. Requires `tsx` in devDeps (already present per `package.json` — verify; if absent, add as part of this task).
    - **Option B:** Add `oven-sh/setup-bun@v2` step before the self-test, then `run: bun .agents/scripts/bkit-install.ts check`. Adds ~3s install step.
    - **Decision:** plan adopts **Option A** (`pnpm tsx`) for parity with how local devs run scripts and to avoid adding a runtime to the CI job.
  - **Package distribution check (Reviewer 2 C7):** `.github/workflows/ci.yml` (this file, at bkit-the-repo root) must be excluded from the npm/git-dep package shipped to consumers. The `package.json` `"files"` array (currently `["dist", ".agents", "README.md"]`) does NOT include `.github/`, so this file is correctly excluded by default. **Verification (no code change):** Run `pnpm pack --dry-run` (or `npm pack --dry-run`) and confirm `.github/workflows/ci.yml` is NOT in the packed file list. Document the result in the task acceptance log. (The consumer-facing CI workflow is the _template_ at `.agents/templates/.github/workflows/ci.yml` — that one ships from v4-2; this one does not.)
  - **Verification:** Push branch → CI runs → all gates pass on this PR; `pnpm pack --dry-run` confirms `.github/` excluded from package distribution.

- [x] **Task 7.2 — Add `.vale.ini` + `.vale/styles/House/` to bkit:** Same content as the templates v4-2 will ship; ensure dogfood `bkit install --lint` is a no-op (already in sync). Slim scopes to `.agents/**` + root `*.md` only.
  - **Verification:** `pnpm lint:prose` runs locally (with Vale installed) without error.

- [x] **Task 7.3 — Add `slop-scan.config.json` + `.prettierignore` to bkit:** Same content as the templates v4-2 will ship.
  - **Verification:** `pnpm lint:slop` and `pnpm format:check` run clean.

- [x] **Task 7.4 — Add `prettier` devDep + `package.json` lint scripts:** Edit `package.json` — add `prettier` to devDeps; add scripts:
  - `format: "prettier --write ."`
  - `format:check: "prettier --check ."`
  - `lint:slop: "node ./node_modules/.bin/slop-scan ..."` (verbatim per seed config).
  - `lint:prose` — **two-stage guard (Reviewer 1 #6 + Reviewer 2 O6):** the v1 wording (`vale .agents/ *.md || (echo skip && exit 0)`) swallowed real Vale findings. Replace with an explicit `command -v vale` test that ONLY masks the binary-missing case; real findings still propagate. Use one of:
    - `lint:prose: "command -v vale >/dev/null 2>&1 && vale .agents/ '*.md' || echo '[bkit] vale not in PATH — skipping'"` — quote the glob to defer expansion to vale itself; only the _missing-binary_ arm reaches the `echo` (after the `||`); when vale is present and exits non-zero on real findings, the script returns vale's non-zero exit because the `&&` short-circuits and the `||` is never evaluated. (Caveat: this still falls through to the `||` on real findings — see alternative below.)
    - **Preferred alternative:** split the guard into a small bash wrapper to make findings vs missing-binary unambiguous: `lint:prose: "bash -c 'if command -v vale >/dev/null 2>&1; then vale .agents/ \"*.md\"; else echo \"[bkit] vale not in PATH — skipping\"; fi'"`. Real Vale findings yield Vale's non-zero exit; missing binary yields exit 0.
    - **Decision:** adopt the **preferred alternative** (bash-wrapped if/else). Quote the `*.md` glob so it is forwarded literally to Vale (which globs internally); avoids zsh-vs-bash mis-glob across macOS/Linux.
  - Run `pnpm install` to lockfile-sync.
  - **Verification:** `pnpm format:check` green; `pnpm lint:prose` green (or graceful warn if Vale missing); commit lockfile changes.

### 🔒 Gate 2: Code Implementation Check

- [x] **Gate 2 - Verified:** Tasks 7.1–7.4 checked off and independently verified.

**Mandatory Tasks (Testing & Documentation):**

- [x] **Verify test coverage against Derived Test Matrix:** v4-1 has no new unit/integration tests — acceptance is the pre-PR gate sequence + CI run. Confirm all five Derived Test Matrix rows green.
- [x] **Update existing tests:** None expected. (Master plan's existing `bkit-install.test.ts` is unchanged in v4-1 — marker generalisation lives in v4-2.)
- [x] **Write new tests:** None.
- [x] **Verify observability:** CI workflow logs to GitHub Actions stdout; no log drains; no PII.
- [x] **Update documentation:** None within v4-1 (decisions/pending appends are v4-3).

### 🔒 Gate 3: Testing & Documentation Check

- [x] **Docs updated:** N/A for v4-1.
- [x] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

## Verification Plan

### Automated Tests

- [x] **Type Check & Lint:** `pnpm typecheck` (`tsc --noEmit`) green; `pnpm format:check` green; `pnpm lint:slop` green; `pnpm lint:prose` green (or graceful skip).
- [x] **Unit + Integration:** `pnpm test` runs the existing test suite — must remain green (v4-1 changes nothing under `.agents/scripts/`).
- [x] **Build:** `pnpm build` (`tsc`) emits the existing `dist/` artefacts unchanged.
- [x] **Self-test:** `pnpm tsx .agents/scripts/bkit-install.ts check` exits 0 (bkit-the-repo is in sync with whatever templates already exist post-v0.1.1; v4-2 will add the new templates, at which point this check stays green by virtue of the dogfood markers added in Tasks 7.1/7.2).
- [x] **Pack-distribution check:** `pnpm pack --dry-run` output does NOT contain `.github/workflows/ci.yml`.
- [ ] **CI on PR:** `.github/workflows/ci.yml` runs all gates green on the PR for this branch (auth-shim NOT needed for bkit's own repo since CI clones itself).

### 🔒 Gate 4: Automated Verification Confirmed

- [x] **Gate 4 - Verified:** Every Automated Tests checkbox checked (CI on PR checkbox deferred — branch not yet pushed). All local verification commands exit 0.

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** Use `gh run list --branch feat/bar-130-ci-lint-scaffolding`, `gh run view --log-failed`, etc. — no GitHub UI checks.

- [x] **Step 1 — Pre-PR gate sequence:** Run `pnpm lint:prose && pnpm lint:slop && pnpm typecheck && pnpm format:check && pnpm test` from worktree root. All green.
- [x] **Step 2 — Pack distribution check:** Run `pnpm pack --dry-run` and confirm packed file list contains only `dist/`, `.agents/`, `README.md`, and `package.json` boilerplate. `.github/`, `.vale*`, `slop-scan.config.json`, `.prettierignore` MUST be absent.
- [ ] **Step 3 — CI green on PR:** Use `gh run list --branch feat/bar-130-ci-lint-scaffolding --limit 1` to confirm the latest CI run exits with `success` status.

> v4-1 has NO Gate 4.5 (manual smoke is owned by v4-3 only).
