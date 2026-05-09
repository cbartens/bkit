# bkit v0.4.0 — Sub-Plan 2: Docs + Dist Rebuild + Pre.2 Smoke + Scratch Consumer Smoke + Production Ship

**Parent Plan:** [bar-138-gh-packages-distribution-plan.md](./bar-138-gh-packages-distribution-plan.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this `bar-138-gh-packages-distribution-plan-2.md` file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document. If a box is `[ ]`, it is NOT DONE, regardless of what the conversation context implies.

> [!IMPORTANT]
> **This is the second half of a two-part runbook split for token-budget reasons.** Sub-plan 1 ([bar-138-gh-packages-distribution-plan-1.md](./bar-138-gh-packages-distribution-plan-1.md)) MUST be complete and green before this sub-plan starts. The parent plan ([bar-138-gh-packages-distribution-plan.md](./bar-138-gh-packages-distribution-plan.md)) holds the full Acceptance Scenario, Breaking Changes, Supersession Inventory, and rollback context. Re-read both before starting if any context is missing here.

## Pre-flight Re-read of Sub-Plan 1

Before executing any task below, re-open [bar-138-gh-packages-distribution-plan-1.md](./bar-138-gh-packages-distribution-plan-1.md) and confirm every checkbox in its **"Hand-off State to Sub-Plan 2"** section is `[x]`. If any item is `[ ]`, return to sub-plan 1 to close it out — do NOT proceed.

The expected entry state for this sub-plan is:

- `feat/bar-138-gh-packages-distribution` branch checked out, pushed to origin, with `0.4.0-pre.1` already published and green.
- `package.json` carries new manifest fields and `version = 0.4.0-pre.1`.
- `.github/workflows/release.yml` exists and is proven by the green pre.1 run.
- Print-constant rewrites + first-install banner edits + consumer template + bkit-self CI edits are present in source but **not yet committed** (sub-plan 1 deliberately deferred their commit so they can fold into the pre.2 commit alongside the doc rewrites and `dist/` rebuild).
- Vitest tests for manifest, print constants, release-workflow structural, and consumer ci.yml template snapshot are written and `pnpm test` green locally.
- `dist/` is intentionally still stale — Task B12 below rebuilds it.

## Scope of This Sub-Plan

- **Phase B (continued):** Tasks B8, B9 (README + .agents/README rewrites), B10, B11, B11.5 (decisions, pending, knowledge appends), B12 (`dist/` rebuild + staleness gate), B13 (full local check suite), B14 (pre.2 commit + tag + push), B15 (pre.2 publish gate).
- **Phase C (continued):** Tasks C3, C4, C5 (scratch consumer smoke + gate).
- **Phase D (production ship):** Tasks D1–D5 (PR open, squash-merge, dev→main promotion, v0.4.0 production tag, BAR-131 #2 resolution).
- **Gates:** 🔒 Gate 2 (code implementation), 🔒 Gate 3 (testing + docs), 🔒 Gate 4 (automated verification).
- **Verification Plan + Manual Verification.**

## Out of Scope (handled in sub-plan 1)

- Branching, manifest edits, `release.yml` creation, pre.1 publish + gate (Tasks A1–A5).
- Installer print-constant rewrites + bkit-self/consumer template ci.yml edits (Tasks B1–B7).
- Vitest tests for manifest, print constants, release-workflow, consumer template (Tasks C0, C1, C1.5, C2).

## Acceptance & Edge Cases

Inherited verbatim from the parent plan ([bar-138-gh-packages-distribution-plan.md § Acceptance Scenario](./bar-138-gh-packages-distribution-plan.md#acceptance-scenario--human-review-required)). Tests/smoke executed in this sub-plan map to the following Derived Test Matrix rows:

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `pnpm check:dist` passes after rebuilding `dist/` from the print-constant edits. | Script | `pnpm check:dist` (CI gate) | B12 |
| `v0.4.0-pre.2` publishes successfully (prints + docs included) from `release.yml`. | Live release smoke | GitHub Actions run on tag push | B14–B15 |
| Scratch consumer repo at `tmp/bar-138-smoke/` installs `@cbartens/bkit@0.4.0-pre.2` via `.npmrc` + `GH_BKIT_TOKEN` and `bkit install --full` runs clean. | Manual smoke | `tmp/bar-138-smoke/` (scratch repo) | C3–C5 |
| `v0.4.0` publishes successfully and is consumable via `^0.4.0` semver from the registry. | Live release smoke | GitHub Actions run on tag push | D4 |

## Architecture & Component Changes (in scope of this sub-plan)

### Documentation

#### [MODIFY] `README.md`

- **Existence Check:** Confirmed.
- Rewrite `## Install` section — replace `pnpm add -D github:cbartens/bkit#v0.2.0` with `pnpm add -D @cbartens/bkit@^0.4.0`; remove pnpm tag-drop note (no longer applies on registry path).
- DELETE `### ⚠️ One-time consumer config (pnpm 10+)` section (the `onlyBuiltDependencies` allowlist is obsolete — registry packages with no lifecycle hooks do not need it).
- Rewrite `## Consumer CI auth` section — single GitHub Packages auth section: (1) PAT scope = `read:packages` (classic) / Packages: read (fine-grained); (2) GHA secret name = `GH_BKIT_TOKEN`; (3) `.npmrc` snippet at repo root; (4) install step `env:` block; (5) explicit pnpm silent-ignore warning.
- Rewrite `## Consumer Vercel auth` section — env-var-only: (1) `vercel env add GH_BKIT_TOKEN preview production`; (2) `.npmrc` committed at repo root is sufficient — NO `installCommand` shim required; (3) explicit warning that any pre-existing `installCommand` git-shim must be removed.
- Refresh any `## Removed in v0.2.0` historical-breaking-changes block to also note v0.4.0 git-dep cutover.

#### [MODIFY] `.agents/README.md`

- **Existence Check:** Confirmed.
- Rewrite `## Distribution` section — describe scoped-package distribution via GH Packages registry; drop the "not published to the npm registry" sentence and the "git dependency from `github.com/cbartens/bkit`" sentence.
- DELETE `### Required consumer config — pnpm 10 build-script allowlist` section (registry packages with no lifecycle hooks).
- Rewrite `## Install / regenerate` opening prose: replace `pnpm add -D github:cbartens/bkit` with `pnpm add -D @cbartens/bkit@^0.4.0`.

#### [MODIFY] `docs/decisions.md`

- **Existence Check:** Confirmed.
- APPEND new ADR entry at EOF (per file's append-only rule):
  - `## DE-3: bkit Distribution via GitHub Packages npm Registry (2026-05-06)`
  - **Category:** infra
  - **Status:** active
  - **Decision:** Distribute `@cbartens/bkit` via GitHub Packages npm registry (`https://npm.pkg.github.com`) starting v0.4.0; v0.3.x remains consumable from git but is frozen.
  - **Why:** Eliminates four classes of friction inherited from git-dep (private-repo clone needs git auth → consumer auth-shim; two surfaces — Actions + Vercel; lifecycle-hook OOM trap; pnpm tag-drop). Registry path is standard scoped-package semantics with one auth file (`.npmrc`) and one env var.
  - **Discarded:** (1) npmjs.org public registry — package is private; private-org plan adds cost. (2) Continue git-dep — all four friction classes persist. (3) GitHub Releases tarball URL — clunky version pinning, no semver resolution. (4) Vendor bkit per-consumer — N×duplication; manual sync. (5) Dual-publish git+registry — code-path drift; contradictory installer guidance.
  - **Source:** phase
  - **Related:** BAR-138, BAR-130 (#5 lifecycle-hook OOM), `docs/plans/completed/202605/bar-138-gh-packages-distribution-design.md`, `package.json`, `.github/workflows/release.yml`

#### [MODIFY] `docs/knowledge.md`

- **Existence Check:** Confirmed.
- APPEND a `KN-N` entry pre-emptively (next free ID per the file's count) for the pnpm v7.20+ silent-`.npmrc`-ignore footgun. Body:
  - **Symptom:** `pnpm install` fails with opaque 401 against npmjs.org (NOT against `npm.pkg.github.com`); error text reads as a generic auth failure, NOT "token missing".
  - **Root cause:** When any `${VAR}` reference inside `.npmrc` resolves to an unset env-var, pnpm v7.20+ silently ignores the ENTIRE `.npmrc` file and falls back to defaults. The `@cbartens:registry=https://npm.pkg.github.com` line is dropped; pnpm hits npmjs.org; npmjs.org has no `@cbartens/bkit`; 401.
  - **Fix:** Ensure `GH_BKIT_TOKEN` is exported in the maintainer's shell, set as a GHA secret on the consumer repo, and set as a Vercel env var (preview + production) for any Vercel-deployed consumer. Verify with `echo "${GH_BKIT_TOKEN:-MISSING}"` before `pnpm install`.
  - **Source:** phase
  - **Related:** BAR-138, DE-3, `.agents/scripts/bkit-modules.ts` (installer print copy enumerates this verbatim).

#### [MODIFY] `docs/pending.md`

- **Existence Check:** Confirmed.
- APPEND a deferred-issue entry for per-consumer migrations (one row per known consumer). Entry per-consumer:
  - `## Consumer migration to @cbartens/bkit registry path — {consumer-name} (2026-05-06)`
  - **Type:** issue
  - **Category:** infra
  - **Severity:** normal
  - **Status:** open
  - **Description:** {consumer-name} still consumes `@cbartens/bkit` via `github:cbartens/bkit#vX.Y.Z` (v0.3.x). Migrate to `^0.4.0` from GH Packages registry: add `.npmrc`, expand `GH_BKIT_TOKEN` PAT scope to `read:packages`, drop GHA `Configure private-repo auth` step, drop Vercel `installCommand` shim.
  - **Source:** phase
  - **Related:** BAR-138, DE-3, `docs/plans/completed/202605/bar-138-gh-packages-distribution-design.md`
- Known consumers to enumerate: `app-gether-life`, `www-visitfrasercoast-com`. (Add others if discovered during build.)

### Cron Jobs & Scheduled Tasks

None.

## Documentation Updates

> Index: `.agents/docs.md`. Treat as code changes — rewrite prose, no lazy bullet appends.

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `docs/decisions.md` | APPEND ADR `DE-3` (distribution model decision; rejected alternatives enumerated). |
| `docs/pending.md` | APPEND per-consumer migration entries (`app-gether-life`, `www-visitfrasercoast-com`, plus any others discovered). |
| `README.md` | Rewrite Install / Consumer CI auth / Consumer Vercel auth sections; delete pnpm 10 allowlist section. |
| `.agents/README.md` | Rewrite Distribution + Install/regenerate sections; delete pnpm 10 allowlist subsection. |
| `docs/knowledge.md` | APPEND `KN-N` entry pre-emptively for the pnpm v7.20+ silent-`.npmrc`-ignore footgun (symptom: opaque 401 from npmjs.org when `${GH_BKIT_TOKEN}` is unset, NOT "token missing"; root cause: pnpm silently ignores entire `.npmrc` on unresolved env-var; fix: ensure `GH_BKIT_TOKEN` is exported in shell / set as GHA secret / set as Vercel env var). This is a maintainer-discoverable gotcha and belongs in the canonical knowledge home — not just buried in installer print copy. |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **Pipeline** | Delete `.github/workflows/release.yml`; revert `package.json#private` to `true` and remove `publishConfig`. | `git revert {feat/bar-138 squash SHA}` rolls everything back atomically. |
| **Code** | `git revert {squash SHA}` on `dev` (or `main` post-promotion). | Single squash commit reverts cleanly; no migration to undo. |
| **Published packages** | `npm deprecate @cbartens/bkit@<bad-version> "deprecated; use 0.3.x git-dep"` against GH Packages. | Cannot delete published versions; deprecation is the only mitigation. |
| **Risk window** | Between `v0.4.0` tag publish and any consumer bumping to `^0.4.0`. | Effectively zero — consumer migration is a separate PR per consumer; until they bump, they stay on v0.3.x git-dep. |

_DB changes: none — code-only — `git revert` sufficient. Deprecation is a sub-step for the registry-published artifact._

## Agent Execution Runbook (Sub-Plan 2)

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate. Continuously check off `[x]` tasks as you go.
> **Blockers:** If a task cannot be completed, **DO NOT fail silently**. Create a Linear issue (label `blocker`) with context before stopping.
> **Step Isolation:** Do NOT jump ahead. Complete each task fully (including its specific verification and checking its box) before starting the exact next task in the list.
> **Progress Updates:** After checking off each major task, post a structured summary as a Linear comment on the issue per `.claude/workflows/conventions.md`.

### Phase B (continued) — Docs + dist rebuild + full local check + pre.2 publish

- [x] **Task B8: Rewrite `README.md` install + consumer-CI + Vercel sections.**
  - Scope: `## Install` — replace `pnpm add -D github:cbartens/bkit#v0.2.0` with `pnpm add -D @cbartens/bkit@^0.4.0`; remove pnpm tag-drop note. DELETE `### ⚠️ One-time consumer config (pnpm 10+)` section. Rewrite `## Consumer CI auth`: PAT scope = `read:packages`; GHA secret = `GH_BKIT_TOKEN`; `.npmrc` snippet at repo root; install step `env:` block; explicit pnpm silent-ignore warning. Rewrite `## Consumer Vercel auth`: env-var-only; `vercel env add` for preview + production; explicit removal of any pre-existing `installCommand` git-shim.
  - Acceptance: `grep -F 'github:cbartens/bkit' README.md` returns empty. `grep -F '@cbartens/bkit@^0.4.0' README.md` matches. `grep -F 'onlyBuiltDependencies' README.md` returns empty (or only in v0.2.0 historical-removal context; verify). `grep -F 'installCommand' README.md` shows context that explicitly tells consumers to remove it.
  - Verification: Manual prose review for tone consistency; `pnpm format:check` and `pnpm lint:prose` green.

- [x] **Task B9: Rewrite `.agents/README.md` Distribution + Install sections.**
  - Scope: `## Distribution` — describe scoped-package distribution via GH Packages; drop "not published to the npm registry" + "git dependency from `github.com/cbartens/bkit`" sentences. DELETE `### Required consumer config — pnpm 10 build-script allowlist` subsection. `## Install / regenerate` opening prose: replace `pnpm add -D github:cbartens/bkit` with `pnpm add -D @cbartens/bkit@^0.4.0`.
  - Acceptance: Same `grep` checks as README — no `github:cbartens/bkit` substrings; new `@cbartens/bkit@^0.4.0` substring present. `onlyBuiltDependencies` removed from this file.
  - Verification: `pnpm format:check` + `pnpm lint:prose` green.

- [x] **Task B10: Append ADR `DE-3` to `docs/decisions.md`.**
  - Scope: APPEND new entry at EOF (file is append-only; respect `<!-- bkit:end -->` boundary — append BELOW it). Body per design (Decision/Why/Discarded/Source/Related fields populated as enumerated in `Architecture & Component Changes § Documentation`).
  - Acceptance: `grep -F '## DE-3:' docs/decisions.md` matches. ADR follows the file's documented format header.
  - Verification: `pnpm format:check` + `pnpm lint:prose` green. Visual review of the appended block.

- [x] **Task B11: Append per-consumer migration entries to `docs/pending.md`.**
  - Scope: APPEND one entry per known consumer (`app-gether-life`, `www-visitfrasercoast-com`). Each entry per the file's documented format. Reference `BAR-138`, `DE-3`, design doc path.
  - Acceptance: `grep -c '## Consumer migration to @cbartens/bkit' docs/pending.md` returns ≥2.
  - Verification: `pnpm format:check` + `pnpm lint:prose` green.

- [x] **Task B11.5: Append `KN-N` entry to `docs/knowledge.md` for the pnpm v7.20+ silent-`.npmrc`-ignore footgun.**
  - Scope: APPEND a new `KN-N` entry at EOF (file is append-only) per the body enumerated in `Architecture & Component Changes § Documentation → docs/knowledge.md`. Symptom / Root cause / Fix / Source / Related fields populated. Use the next free `KN-N` ID per the file's current count.
  - Acceptance: `grep -F 'silently ignores' docs/knowledge.md` matches the new entry. Entry follows the file's documented format header.
  - Verification: `pnpm format:check` + `pnpm lint:prose` green. Visual review of the appended block.

- [x] **Task B12: Regenerate `dist/`.**
  - Scope: With source edits from sub-plan 1's Tasks B1–B5 (and any test-file edits) staged but NOT yet committed, run the staleness-then-rebuild flow:
    1. Run `pnpm check:dist` — MUST exit non-zero (proves committed `dist/` is stale relative to the just-edited source).
    2. Run `pnpm build` (tsc emit) — regenerates `dist/` on disk to match the new source.
    3. Inspect `git diff dist/` — should reflect ONLY the print-constant edits from sub-plan 1's Tasks B1–B5 (no unrelated emit churn).
    4. Stage `dist/` alongside the source edits, then commit (the actual commit is folded into Task B14's commit; do not create an interim commit here).
    5. Re-run `pnpm check:dist` — MUST exit zero (proves the on-disk emit now matches the staged-and-about-to-be-committed `dist/`, i.e. the freshly rebuilt bytes are what will land in the SHA tagged by Task B14).
  - Acceptance: Step 1 exits non-zero. Step 5 exits zero. Both confirmed via captured CLI output (paste into Linear ship comment).
  - Verification: After Task B14's commit, `git diff --stat HEAD~1 dist/` shows only the print-constant deltas. `pnpm bkit check` runs without crashing locally.
  - Note (why this ordering): `pnpm check:dist` compares the on-disk emit against the on-disk committed `dist/`. The rebuild in step 2 writes new bytes to disk; staging them in step 4 means they ARE the on-disk committed `dist/` from `check:dist`'s point of view (working-tree comparison), so step 5 passes. Skipping step 4 (or running step 5 before staging) would either leave step 5 red or make a green result meaningless.

- [x] **Task B13: Run full local check suite.**
  - Scope: `pnpm typecheck && pnpm test && pnpm format:check && pnpm lint:prose && pnpm lint:slop && pnpm check:dist`. All must pass.
  - Acceptance: Every script exits 0.
  - Verification: Capture run output; if any fails, fix before tagging pre.2.

- [x] **Task B14: Bump `version` to `0.4.0-pre.2`, commit, tag.**
  - Scope: Edit `package.json#version` → `0.4.0-pre.2`. Commit `feat(bar-138): installer prints + README + ADR DE-3 for GH Packages`. Push branch. Tag `v0.4.0-pre.2` on the same SHA. Push tag.
  - Acceptance: `git describe --tags --exact-match` = `v0.4.0-pre.2`. `gh run list --workflow=release.yml --limit=1` shows the tagged run starting.
  - Verification: `gh run view --log` for that run shows full check suite green and `npm publish` succeeds. `https://github.com/cbartens/bkit/packages` shows `@cbartens/bkit@0.4.0-pre.2`.

- [x] **Task B15 🔒 GATE — pre.2 publish smoke validates print/doc layer before scratch-consumer test.**
  - Scope: If pre.2 publish fails, STOP. Diagnose; the failure surface is now print-constant or doc related (since pre.1 already validated the pipeline). Fix on branch; re-tag only after deleting the failed tag.
  - Acceptance: pre.2 visible in GH Packages UI; release.yml run green.
  - Verification: `gh api …/packages/npm/bkit/versions` returns `0.4.0-pre.2`.

### Phase C (continued) — Scratch consumer smoke + gate

- [x] **Task C3: Create scratch consumer repo for end-to-end smoke.**
  - Scope: Under `tmp/bar-138-smoke/` (NEVER `/tmp/` per repo rules), `git init`; minimal `package.json` (`name`, `version`, `private: true`, `packageManager: pnpm@10.33.0`); `.npmrc` with the registry+authToken lines; export `GH_BKIT_TOKEN` (PAT with `read:packages`).
  - Acceptance: `tmp/bar-138-smoke/.npmrc` exists with the two required lines. `tmp/bar-138-smoke/package.json` is valid.
  - Verification: `cat tmp/bar-138-smoke/.npmrc` shows registry + authToken. `tmp/` is git-ignored at repo root (verify against `.gitignore`).

- [ ] **Task C4: Smoke-install `@cbartens/bkit@0.4.0-pre.2` in scratch repo.**
  - Scope: `cd tmp/bar-138-smoke; pnpm add -D @cbartens/bkit@0.4.0-pre.2`. Verify `pnpm install` succeeds (registry resolution, no git auth involved). `pnpm exec bkit install --full` → run completes, `.agents/`, `.claude/`, `.cursor/`, `.github/workflows/ci.yml`, `.husky/`, `.vale/` all seeded; print sink emits the rewritten messages (capture stdout for inspection).
  - Acceptance: `bkit install --full` exits 0. Captured stdout contains `.npmrc`-based instructions (or shows present-state silence if `gh` reports the secret as set on the scratch repo). First-install banner has no `onlyBuiltDependencies` line.
  - Verification: Visual inspection of captured stdout. Inspection of seeded `.github/workflows/ci.yml` — has no `Configure private-repo auth` step; install step has `env: GH_BKIT_TOKEN`. Inspection of seeded `.agents/.bkit-version` = `0.4.0-pre.2`.

- [ ] **Task C5 🔒 GATE — scratch-consumer smoke test must pass before cutting v0.4.0 production.**
  - Scope: If smoke fails (registry 401, install failure, missing template fields, regression in print copy), STOP. Diagnose; fix in bkit; cut a `v0.4.0-pre.3` if needed; re-run smoke. Do NOT cut `v0.4.0` until smoke is green.
  - Acceptance: Captured smoke transcript shows full success per Task C4 acceptance criteria.
  - Verification: Save transcript to the EXACT path `docs/plans/logs/bar-138/smoke-pre.2.txt` (no hedged alternatives — the ship-phase summary subagent expects this canonical filename for attachment). If a re-cut to `pre.3` was required, save the final passing transcript to `docs/plans/logs/bar-138/smoke-pre.3.txt` and reference both files in the ship comment.

### Phase D — Production cut + ship-phase handoff

- [x] **Task D1: Open PR `feat/bar-138-gh-packages-distribution → dev`.**
  - Scope: `gh pr create --base dev --title 'feat(bar-138): GitHub Packages npm registry distribution (v0.4.0)' --body '<bkit-build summary fenced section>'`. Body includes link to design doc, ADR `DE-3`, smoke transcript.
  - Acceptance: PR opened; CI runs trigger.
  - Verification: `gh pr checks {PR_NUMBER}` shows `ci.yml` running.

- [ ] **Task D2: Squash-merge PR after CI green + human review.**
  - Scope: `gh pr merge {PR} --squash --delete-branch --body ""` (per repo rules; squash is mandatory).
  - Acceptance: PR merged; squash commit on `dev`.
  - Verification: `git log --oneline dev | head -1` shows the squash commit message.

- [ ] **Task D3: Promote `dev` → `main` (per repo's standard path).**
  - Scope: Standard PR `dev → main` with explicit human approval (per repo rules). After merge, `main` has the squash commit.
  - Acceptance: `main` tip contains the squash commit.
  - Verification: `git log --oneline main | head -1` matches.

- [ ] **Task D4: Bump `version` to `0.4.0`, commit, tag, push.**
  - Scope: On `main` (or via short-lived branch + fast-forward PR if branch protection requires), edit `package.json#version` → `0.4.0`. Commit `chore(bar-138): cut v0.4.0`. Push. Tag `v0.4.0` on the resulting SHA. Push tag.
  - Acceptance: `git describe --tags --exact-match origin/main` = `v0.4.0`. `release.yml` run on the tag is starting.
  - Verification: `gh run view --log` for the tag run shows full check suite green and `npm publish` succeeds. `https://github.com/cbartens/bkit/packages` shows `@cbartens/bkit@0.4.0`.

- [ ] **Task D5: Mark BAR-131 #2 resolved.**
  - Scope: Linear comment on BAR-138 + on BAR-131 #2 referencing the v0.4.0 ship; flip BAR-131 #2 status to resolved per workspace conventions.
  - Acceptance: Linear status reflects resolution.
  - Verification: Linear comment thread shows the resolution note.

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Testing & Documentation`.

- [ ] **Gate 2 - Verified:** Every checkbox above (sub-plan 1 Tasks A1–A5, B1–B7, C0, C1, C1.5, C2 + sub-plan 2 Tasks B8–B11, B11.5, B12–B15, C3–C5, D1–D5) independently verified and checked off against the plan.

> [!IMPORTANT]
> **Testing Strategy (See `docs/testing.md`):**
>
> - **Distribution/installer-print logic MUST be tested via Vitest unit tests only.** No Playwright (no UI). No integration tests against the live registry — pre-release tag publish IS the integration test.
> - **Snapshot tests** for templates (consumer ci.yml) protect against regression in seeded YAML.
> - **End-to-end validation** is the scratch-consumer smoke (Task C4), not an automated integration test — registry auth requires a real PAT and live GH Packages, neither suitable for CI.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Every row in `Acceptance Scenario → Derived Test Matrix` has a corresponding task across sub-plans 1 and 2. Confirm one-to-one mapping; add new tasks if a row is uncovered.
- [ ] **Update existing tests:** Inspect `.agents/scripts/*.test.ts` (or wherever bkit's existing Vitest suite lives) and adjust any tests that asserted the old print-constant content (e.g. tests checking for `insteadOf` literal, or for `onlyBuiltDependencies` in the first-install banner). Update assertions to match new constants.
- [ ] **Write new tests:** Tasks C0 (manifest), C1 (print constants), C1.5 (release.yml structural), C2 (consumer ci.yml template snapshot) — all delivered in sub-plan 1; verify they remain green after the dist rebuild + doc edits in this sub-plan.
- [ ] **Verify observability:** Installer prints already follow `[bkit] {message}` convention — preserved in rewrites. No new log names; no new tracing scopes; no `docs/observability.md` changes.
- [ ] **Update documentation:** Tasks B8 (README), B9 (.agents/README), B10 (decisions DE-3), B11 (pending.md), B11.5 (knowledge.md `KN-N`) are the doc deliverables. Confirm `.agents/docs.md` index still accurate (no new doc files added; just updates to existing).

### 🔒 Gate 3: Testing & Documentation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Verification Plan`.

- [ ] **Docs updated:** Every row in `Documentation Updates` table completed. `.agents/docs.md` still accurate.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

## Verification Plan

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm typecheck && pnpm format:check && pnpm lint:prose && pnpm lint:slop`. All exit 0.
- [ ] **Unit tests:** `pnpm test` — all pass, including new assertions from Tasks C1 + C2.
- [ ] **Dist staleness gate:** `pnpm check:dist` — exits 0 (proves committed dist matches re-emitted dist).
- [ ] **bkit-self ci.yml run:** Push branch; `gh run watch {run_id} -e` against the latest `ci.yml` run on the feature branch — green.
- [ ] **Pre-release publish runs:** `release.yml` runs on `v0.4.0-pre.1` (sub-plan 1 Task A4–A5) and `v0.4.0-pre.2` (sub-plan 2 Task B14–B15) tags both green.
- [ ] **Build configuration:** No new mock files; no new test config exclusions needed in tsconfig.

> [!IMPORTANT]
> **No Architectural Downgrades**: If `release.yml` fails on auth, do NOT add a `prepublishOnly` hook to "fix" it (would re-introduce lifecycle hooks — BAR-130 invariant violation). Instead, debug `permissions: packages: write` + `NODE_AUTH_TOKEN` wiring per `docs/knowledge.md` and the design doc.

### 🔒 Gate 4: Automated Verification Confirmed

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Manual Verification`.

- [ ] **Gate 4 - Verified:** Every checkbox in Automated Tests independently verified and checked off. Explicit proof (test outputs, CLI results, GHA run links) gathered and pasted into the Linear ship comment.

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** Use local CLIs (`gh`, `npm`, `pnpm`) instead of asking users to check dashboards.

- [ ] **Step 1 — Confirm pre.1 published:** `gh api -H "Accept: application/vnd.github+json" /users/cbartens/packages/npm/bkit/versions | jq '.[].name'` includes `0.4.0-pre.1`.
- [ ] **Step 2 — Confirm pre.2 published:** Same call, includes `0.4.0-pre.2`.
- [ ] **Step 3 — Run scratch-consumer smoke (Task C4) against pre.2 locally:** Confirm `pnpm install` resolves from `https://npm.pkg.github.com`, `bkit install --full` runs clean, print sink shows new `.npmrc`-based copy.
- [ ] **Step 4 — Confirm v0.4.0 published:** Same `gh api` call, includes `0.4.0`.
- [ ] **Step 5 — Confirm `release.yml` triggered green on v0.4.0:** `gh run list --workflow=release.yml --limit=5` and `gh run view {run_id}` for the v0.4.0 tag run — all steps green, `npm publish` step printed `+ @cbartens/bkit@0.4.0`.
- [ ] **Step 6 — Confirm BAR-131 #2 marked resolved:** Linear MCP query on BAR-131 reflects status update.
- [ ] **Step 7 — Confirm bkit-self ci.yml still green post-cleanup:** `gh run list --workflow=ci.yml --limit=3` on the feature branch and on `dev` post-merge — all green; "Configure private-repo auth" step is gone but no run failed because of its absence.
