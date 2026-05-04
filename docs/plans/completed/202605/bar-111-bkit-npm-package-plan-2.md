# ⚠️ OUT OF SCOPE FOR THIS REPO

> [!CAUTION]
> **This sub-plan covers consumer-side migration in `app-gether-life`, NOT producer work in `bkit`.** It is not actionable from this repo. After `@bartens/bkit@0.1.0` is published (per `bar-111-bkit-npm-package-plan.md`), this plan is executed in the `app-gether-life` repo against its branch — not here.
>
> Internal links below still reference `plan-v3-checked.md` / `plan-v4-*.md` filenames that do not exist on disk (workflow bug logged in `.agents/friction.md`). They have not been rewritten because this file is not the active runbook for this repo.

---

# bkit npm Package Extraction — Sub-plan B: Consumer Migration (BAR-111)

**Parent Plan:** [plan-v4-split.md](./plan-v4-split.md)
**Source plan:** [plan-v3-checked.md](./plan-v3-checked.md) (Phase 7)
**Sibling sub-plans:** [plan-v4-1.md](./plan-v4-1.md) (producer; must be complete), [plan-v4-3.md](./plan-v4-3.md) (smoke + upgrade)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state. Always read this file natively before executing steps. Source of truth is the literal `[x]` vs `[ ]` checkboxes here.
>
> **Hard precondition:** Sibling sub-plan A must be complete — `npm view @bartens/bkit version` MUST return `0.1.0` before any task in this sub-plan executes. Verify in Pre-Flight.

## Context & Goals

Phase B of agent-stack consolidation, consumer-side. Sibling sub-plan A published `@bartens/bkit@0.1.0` to npm. This sub-plan migrates `app-gether-life` to consume it: pin it as a devDep, delete the local install script + wrapper + any `*.bflow-version` files, switch the CI drift gate to `pnpm dlx @bartens/bkit check`, verify byte-parity between pre- and post-extraction generated dirs, update docs, and ship via PR squash-merged into `app-gether-life/dev`.

**Success Criteria (this sub-plan):**

- `app-gether-life/package.json` has `"@bartens/bkit": "0.1.0"` as exact-pin devDep.
- Local install script + `package.json#scripts` wrapper deleted (or recorded as no-op if BAR-110 didn't produce them).
- `*.bflow-version` files (if any) deleted; replaced by `.bkit-version`.
- CI drift gate workflow invokes `pnpm dlx @bartens/bkit check` (or recorded as no-op + pending follow-up if no pre-existing CI gate).
- Post-`install` `git diff HEAD -- .claude .cursor .agents` is empty (proves byte parity with pre-extraction generated state).
- `pnpm dlx @bartens/bkit check` exits 0.
- Docs (`docs/decisions.md`, `docs/architecture.md`, `docs/knowledge.md`, `docs/pending.md`, `docs/completed.md`) updated.
- PR opened, CI green, squash-merged to `dev`.

Successor sub-plan C exercises the published `0.1.0` (and optionally `0.1.1`) end-to-end against this consumer plus a second-repo smoke-test target.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> Human must read and confirm. Everything downstream is derived from this section.

### Spec — what good looks like

Per `docs/plans/template.md` § Acceptance Scenario Spec.

### Narrative _(design-missing fallback)_

⚠️ MISSING: design doc has no Acceptance Scenario — human must provide before plan proceeds.

<!-- draft: reviewer note — not a substitute for human input
Suggested narrative (consumer-side slice): "As a maintainer of `app-gether-life`, after `@bartens/bkit@0.1.0` is published, I add it as an exact-pinned devDep, delete the local install script, switch the CI drift gate to `bkit check`, run `bkit install`, observe an empty `git diff` against the pre-extraction generated state, and merge a clean PR to `dev`."
The human MUST replace the `⚠️ MISSING` line above with confirmed Narrative copy before Gate 1 may pass.
-->

### Success Criteria _(design-missing fallback)_

⚠️ MISSING: design doc has no Acceptance Scenario — human must provide before plan proceeds.

<!-- draft: reviewer note — not a substitute for human input
Suggested bullets (consumer-side slice):
- `@bartens/bkit@0.1.0` is pinned exactly in `app-gether-life/package.json` devDeps.
- Local install script + wrapper script + `*.bflow-version` files removed (or recorded as no-op).
- CI drift gate invokes `pnpm dlx @bartens/bkit check`.
- Post-`bkit install`, `git diff HEAD -- .claude .cursor .agents` is empty.
- Migration PR squash-merged into `app-gether-life/dev` with green CI.
The human MUST replace the `⚠️ MISSING` line above with confirmed bullets before Gate 1 may pass.
-->

### Concrete Example _(plan expands)_

**Setup:** Sibling sub-plan A complete (`npm view @bartens/bkit version` returns `0.1.0`). Maintainer has clean working copy of `app-gether-life` on `dev`.

**Steps:**

1. `cd ~/Documents/GitHub/app-gether-life && git checkout -b feat/bar-111-consume-bkit`.
2. `pnpm add -D @bartens/bkit@0.1.0 -E` → `package.json#devDependencies` shows `"@bartens/bkit": "0.1.0"`.
3. Delete local install script (path resolved by grep in Pre-Flight Task 0.4); remove its `package.json#scripts` wrapper; delete any `*.bflow-version` files.
4. Update CI workflow file invoking the install script; replace with `pnpm dlx @bartens/bkit check`.
5. `pnpm dlx @bartens/bkit install` → `.claude/`/`.cursor/` regenerated.
6. `git diff HEAD -- .claude .cursor .agents` → empty.
7. `pnpm dlx @bartens/bkit check` → exit 0.
8. Update docs, commit, push, open PR to `dev`, CI green, squash-merge.

**Outcome:** `app-gether-life` consumes `@bartens/bkit@0.1.0`; agent-stack distribution centralised; no behaviour change.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| BAR-110 deferred / never produced a local install script | Pre-Flight Task 0.4 grep returns no matches; runbook tasks 7.3 collapse to no-op (recorded in plan log as such), Gate 2 sub-row "Supersession Inventory TBD-path rows resolved" satisfied via the no-op evidence. |
| No pre-existing CI workflow references the install script | Task 7.4 collapses to no-op; record in plan log: "No pre-existing CI drift gate found; recommend follow-up to add `.github/workflows/bkit-check.yml`" (track in `docs/pending.md`). |
| Post-`install` non-empty diff in `.claude/` or `.cursor/` | Halt: indicates byte-parity regression vs sibling sub-plan A's published `0.1.0` payload. Investigate transform / template drift. Do NOT bypass; flag as blocker. |
| `*.bflow-version` files present (BAR-110 created with stale name) | Delete via `find . -name '*.bflow-version*' -print -delete`. Record paths deleted (or "none found") in plan log. |
| `pnpm install` fails post-add | Investigate registry resolution (`pnpm dlx @bartens/bkit@0.1.0 --help`); if 404, sibling sub-plan A's publish step did not land — escalate, do NOT proceed. |
| `bkit check` non-zero post-install on green local | Indicates drift between consumer's existing `.claude/`/`.cursor/` and the regen output of `0.1.0`. Investigate template parity (Task 5.2 in sibling A). Flag as blocker. |

### Derived Test Matrix

> All automated tests live in sibling sub-plan A (the bkit repo). This sub-plan's verification is migration-side — manual diff + CI gate behaviour.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| `app-gether-life` consumption: post-`install` `git diff HEAD -- .claude .cursor .agents` empty | Manual | runbook Task 7.5 (no automated test file) |
| CI drift gate red on intentional drift | Manual (CI) | runbook Task 7.4a |

### 👤 ✅ Human Confirmation

- [x] **Narrative replaced:** Narrative section above no longer contains `⚠️ MISSING`. Human edited in-place.
- [x] **Success Criteria replaced:** Success Criteria section above no longer contains `⚠️ MISSING`. Human edited in-place.
- [x] **Acceptance Scenario confirmed:** Reviewed Narrative, Success Criteria, Concrete Example, Edge Cases, Derived Test Matrix.

> [!CAUTION]
> Agent: Do NOT pass Gate 1 until ALL THREE checkboxes are `[x]` AND the literal string `⚠️ MISSING` is absent from this section.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

### Naming reconciliation vs Linear description

> [!IMPORTANT]
> The Linear description (plan-input.md) predates the canonical agents-stack rename. This sub-plan adopts the **current source of truth** in `app-gether-life/.agents/`. Names below are decided facts.

<!-- prettier-ignore -->
| Linear description (stale) | Canonical (this plan) | Source of truth |
| --- | --- | --- |
| `@bartens/bflow` | `@bartens/bkit` | plan-input.md comment override (2026-05-01) |
| `.bflow-version` | `.bkit-version` | plan-input.md comment override |
| `<!-- bflow:start -->` / `<!-- bflow:end -->` | `<!-- bkit:start -->` / `<!-- bkit:end -->` | already in `app-gether-life/.agents/` |

> [!IMPORTANT]
> **Breaking changes (this sub-plan):**
>
> - `app-gether-life` local install script (path TBD by Pre-Flight Task 0.4 grep — likely `scripts/install-agents.{sh,ts}` or similar) is **DELETED**. Anyone with a local checkout must `pnpm install` after pulling to get the new `@bartens/bkit` devDep.
> - `package.json#scripts` wrapper for the install script is DELETED. CI drift gate switched from local script to `pnpm dlx @bartens/bkit check` in same commit to avoid green/red gap.
> - `.agents/.bflow-version` (if BAR-110 created one) → DELETED; replaced by `.bkit-version` (created by `bkit init`/`upgrade` — but for `app-gether-life`, the file is created by the first `bkit install` against an existing `.agents/` tree via the cache safety net described in sibling sub-plan A § cli/install.ts).
> - Managed-block markers — current files in `app-gether-life/.agents/` already use `<!-- bkit:start -->` / `<!-- bkit:end -->`, so no rename needed there. (If older `<!-- bflow:* -->` markers exist anywhere in `.agents/`, treat as edge case and migrate inline.)
>
> **Repo footprint changes in `app-gether-life`:**
>
> - Add `@bartens/bkit` to root `package.json#devDependencies` (exact pin: `"@bartens/bkit": "0.1.0"`).
> - Delete local install script and any `package.json#scripts` wrapper for it.
> - Update CI drift gate to call `pnpm dlx @bartens/bkit check` instead of local script.
> - No DB, no API, no UI changes.

### 👤 ✅ Human Confirmation

- [x] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> Agent: Do NOT pass Gate 1 until this checkbox is `[x]`.

---

## Alternative Approaches & Recommendations

**Considered & rejected:**

- **Keep the local install script as a thin wrapper around `pnpm dlx @bartens/bkit install`** — rejected; defeats single-source promise; one wrapper layer too many.
- **Caret/tilde range pin (`^0.1.0`) instead of exact** — rejected per central-source promise; consumers MUST pin exact for reproducibility.

**Future-phase (out of scope this sub-plan):**

- Setting up GitHub Actions CI in the new `bkit` repo (recommended; tracked in `docs/pending.md` Task 7.7 entry).
- Adding `.github/workflows/bkit-check.yml` if no pre-existing CI gate exists in `app-gether-life` (tracked in `docs/pending.md` per Task 7.4 fallback).

## Out of Scope (this sub-plan)

- All bkit producer work (sibling sub-plan A — already complete by precondition).
- Second-repo smoke + upgrade smoke (sibling sub-plan C).
- Real-registry `0.1.1` publish (sibling sub-plan C, gated).
- Changes to subagent prompts, workflows, IDE rules content — pure consumer-side migration, no semantic edits.

## Merge Method

**Squash.** Single PR into `app-gether-life/dev`, squash-merged.

## Supersession Inventory

> Default = DELETE. Each row mirrored in Architecture & Component Changes and Agent Execution Runbook below.

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `app-gether-life/scripts/install-agents.{sh,ts}` _(actual filename TBD by Pre-Flight Task 0.4 grep)_ | `bkit/cli/bin.ts` published as `@bartens/bkit` | DELETE | Logic moves wholesale into bkit's CLI; no consumer should import locally. |
| `app-gether-life/package.json#scripts.install:agents` _(or whatever the wrapper is named)_ | `pnpm dlx @bartens/bkit install` invocation | DELETE | Wrapper points at deleted script; replace with bkit invocation in CI gate path. |
| Any local `*.bflow-version` file in `app-gether-life` _(if BAR-110 created one)_ | `.agents/.bkit-version` | DELETE | Renamed per bflow→bkit migration. Confirm via `find . -name '*.bflow-version*'` before deleting. |

> [!NOTE]
> If post-grep there's no local install script (BAR-110 deferred), each row collapses to "no-op — artifact not present". Plan log MUST record either (a) the resolved path that was deleted, or (b) "no-op — artifact not present". No row may remain in TBD state at Gate 2.

## Security & Privacy

- [x] **New API route** — N/A.
- [x] **New DB table/column** — N/A.
- [x] **Role-gated mutation** — N/A.
- [x] **User input** — N/A (CLI argv parsing lives in bkit, not consumer).
- [x] **PII** — N/A.
- [x] **Redirect URL** — N/A.
- [x] **Webhook** — N/A.
- [x] **New secret/env var** — N/A. `NPM_TOKEN` is publisher-only (sibling A); MUST NOT be set in `app-gether-life`.

_No new APIs, DB writes, or runtime secrets in `app-gether-life`._

## 🚨 Pre-Flight / Dependencies 🚨

### Core (always verify)

- [x] **Sibling sub-plan A complete:** `npm view @bartens/bkit version` returns `0.1.0`. `pnpm dlx @bartens/bkit@0.1.0 --help` works. If either fails, abort — sibling A did not finish.
- [x] **Package Management:** Verify `app-gether-life/package.json` has free room for `@bartens/bkit` devDep. `pnpm-lock.yaml` will sync cleanly post-add.
- [x] **Dependency Versions:** `pnpm --version` ≥ 9; `node --version` ≥ 20.
- [x] **User Context:** Verify write access to `~/Documents/GitHub/app-gether-life/`. `gh auth status` shows authenticated user with PR-create rights.
- [x] **Pending Blockers:** Query Linear for open `blocker`-labelled issues touching agent stack / install script.
- [x] **Project Context:** Re-read `app-gether-life/.agents/rules.md` (universal rules + project rules).
- [x] **Testing & Quality:** `app-gether-life/docs/testing.md` applies for the consumer-side checks (`pnpm turbo lint typecheck format:check test`).
- [x] **Prerequisite Plans:** **BAR-110 must be merged** (verified in sibling A; restated for safety).
- [x] **Pre-Flight Task 0.4:** In `app-gether-life`, grep for the install script: `rg -l 'install.*agents|\.agents/' package.json scripts/ .github/workflows/`. Record exact paths in plan log. (Sibling A also performed this grep; this sub-plan re-runs in case repo state changed since.)

### Conditional

- [x] **Secrets & Env Vars** — N/A. No new secrets in `app-gether-life`.
- [x] **Schema State** — N/A.
- [x] **Architecture & UI** _(repo footprint change)_: Adds devDep + deletes script. Topology change documented in `docs/architecture.md` (Task 7.7).
- [x] **Observability** — N/A. No log drains, no OTel, no CDC.
- [x] **Notifications** — N/A.

### 🔒 Gate 1: Prerequisites Check

- [x] **Sibling A artifact live:** `npm view @bartens/bkit version` returned `0.1.0`.
- [x] **Narrative populated:** Acceptance Scenario § Narrative no longer contains `⚠️ MISSING`. Human-confirmation `Narrative replaced` is `[x]`.
- [x] **Success Criteria populated:** Acceptance Scenario § Success Criteria no longer contains `⚠️ MISSING`. Human-confirmation `Success Criteria replaced` is `[x]`.
- [x] **Acceptance Scenario confirmed:** Human checked the box.
- [x] **Breaking Changes confirmed:** Human checked the box.
- [x] **Pre-Flight Task 0.4 grep recorded:** Resolved paths (or "no-op — none found") logged.
- [x] **Gate 1 - Verified:** All Core checked. All applicable Conditional checked.

## Data Schema Integration

None.

## Architecture & Component Changes

### Repo: `~/Documents/GitHub/app-gether-life/` (MODIFY)

#### [DELETE] `app-gether-life/scripts/install-agents.{sh,ts}` _(actual path from Pre-Flight Task 0.4)_

- **Reason:** replaced by `pnpm dlx @bartens/bkit install`.
- If no script exists (BAR-110 deferred), record finding and adjust runbook accordingly — this row becomes "no-op".

#### [MODIFY] `app-gether-life/package.json`

- **Existence Check:** Confirmed at `app-gether-life/package.json`.
- Add `"@bartens/bkit": "0.1.0"` to `devDependencies` (exact pin — no caret/tilde, per central-source promise).

#### [DELETE] `app-gether-life/package.json#scripts.install:agents` _(actual key name from Pre-Flight Task 0.4)_

- **Reason:** Wrapper points at the deleted local install script; replace with `pnpm dlx @bartens/bkit install` invocation in CI gate path.
- If wrapper is referenced by other scripts (e.g., `postinstall`), replace with `pnpm dlx @bartens/bkit install` _OR_ a thin wrapper that calls it.
- TBD-path resolution recorded in plan log per Task 7.3b.

#### [MODIFY] CI drift gate workflow file _(path TBD by Pre-Flight Task 0.4 grep — likely `.github/workflows/*.yml`)_

- **Existence Check:** Build phase verifies via `rg -l 'install.*agents' .github/workflows/`.
- Replace local-script invocation with `pnpm dlx @bartens/bkit check`.
- Keep gate's existing trigger (push / PR), exit-code semantics unchanged (`check` already returns non-zero on drift).

#### [DELETE] `app-gether-life/.agents/.bflow-version` _(if present)_

- **Reason:** renamed to `.bkit-version`. Confirm via `find . -name '*.bflow-version*'` before deleting.

### Database Migrations

None.

### Cron Jobs & Scheduled Tasks

None.

## Documentation Updates

> Index: `.agents/docs.md`. Treat as code changes — rewrite prose, no lazy bullet appends.

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `app-gether-life/docs/decisions.md` | Append ADR: "Agent stack distributed via `@bartens/bkit` npm package" — why npm over submodule/vendoring; managed-block markers strategy; `.bkit-version` pin. |
| `app-gether-life/docs/architecture.md` | Note that `.agents/` payload origin is the published `@bartens/bkit` package, NOT hand-edited locally. Link to bkit repo. Note CI drift gate. |
| `app-gether-life/docs/knowledge.md` | Append: "Editing `.agents/` directly = orphan changes. Upstream to `bkit` repo, publish, then `bkit upgrade` here." |
| `app-gether-life/.agents/docs.md` | If/when bkit-managed payload changes the index, update. (No change expected at 0.1.0 — payload byte-identical.) |
| `app-gether-life/docs/completed.md` | Append entry for BAR-111 once shipped (Phase 7 PR merged AND sibling sub-plan C complete). |
| `app-gether-life/docs/pending.md` | **Append entries for the deferred / out-of-DoD items** (one entry each, append-only at EOF, format per file header): (a) Phase 9 publishing a real `0.1.1` to npm registry — recommend `pnpm pack` smoke as default; gate real publish behind explicit human go-ahead. (b) `bkit check` CLI verb implemented but not in Linear DoD's three-verb list (`init`, `install`, `upgrade`); flag for follow-up confirmation. (c) `cursorModelByAgent` auto-generation from `agents/prompts.md` (v0.1.0 ships hand-written + parity test). (d) Template token substitution machinery (v0.1.0 literal templates). (e) `.agents/.bkit-cache/{previousVersion}/` pruning policy (v0.1.0 retains all). (f) GitHub Actions CI in the new `bkit` repo. (g) If Pre-Flight Task 0.4 found no pre-existing CI drift gate: add `.github/workflows/bkit-check.yml`. Do NOT remove or rewrite existing entries. |

_No changes to data-schema, data-pipeline, testing, observability, security, deployments docs in `app-gether-life`._

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **app-gether-life consumer migration** | `git revert {COMMIT}` of the migration PR — restores local install script + removes `@bartens/bkit` devDep. | Single squash-merged commit; revert clean. |
| **CI drift gate** | Captured in same revert. | — |
| **Risk window** | Zero — no DB, no runtime. Worst case: tooling regression caught by `bkit check` failing in CI; fall back to revert. | — |

_No DB changes. Code-only. `git revert` sufficient._

## Agent Execution Runbook

> Chronological. Step Isolation. Continuous execution. Do not pause for user permission at any Gate.

**Phase 7: Migrate `app-gether-life` consumer.**

- [x] **Task 7.1:** In `app-gether-life`, create branch `feat/bar-111-consume-bkit`.
- [x] **Task 7.2:** Run `pnpm add -D @bartens/bkit@0.1.0 -E` (exact pin).
- [x] **Task 7.3:** Delete local install script (path from Pre-Flight Task 0.4). Remove `package.json#scripts` wrapper. If `postinstall` referenced it, replace with `pnpm dlx @bartens/bkit install`.
- [x] **Task 7.3a:** Delete any `*.bflow-version` files if present: `find app-gether-life -name '*.bflow-version*' -print -delete`. Record outcome (paths deleted, or "none found") in plan log. Confirms Supersession Inventory Row 3.
- [x] **Task 7.3b:** **Confirm Supersession Inventory TBD-path resolution.** For each `[DELETE]` row whose path was TBD (install script, `package.json#scripts.install:agents`, `*.bflow-version`): record in plan log either (a) the resolved path that was deleted, or (b) "no-op — artifact not present (BAR-110 deferred / never created)". This row may NOT remain unresolved at Gate 2.
- [x] **Task 7.4:** Update CI drift-gate workflow file (path from Pre-Flight Task 0.4) to invoke `pnpm dlx @bartens/bkit check`. **Fallback:** if Task 0.4 found no CI workflow referencing the install script or `.agents/`, this task is a NO-OP. Document the absence in the plan log: "No pre-existing CI drift gate found; recommend follow-up to add `.github/workflows/bkit-check.yml`" (track in `docs/pending.md`). Do NOT silently skip without recording.
- [x] **Task 7.4a:** **Verify CI drift gate red on intentional drift.** On a throwaway branch off the migration PR, intentionally hand-edit one generated file (e.g., add a stray line to `.cursor/agents/<name>.md`); push; confirm CI run fails on the `pnpm dlx @bartens/bkit check` step. Revert the throwaway commit. Skip if Task 7.4 is no-op (no CI gate exists) — record skip reason in plan log.
- [x] **Task 7.5:** Run `pnpm dlx @bartens/bkit install` locally. **Verify `git diff HEAD -- .claude .cursor .agents` is empty** — proves byte parity with pre-extraction generated state. Diff in `package.json` / `pnpm-lock.yaml` / the deleted local install script is expected (those are the migration commit's own staged changes); they are tracked separately by Task 7.8 and are NOT a regression. Linear DoD's "`git diff HEAD` empty" applies AFTER the migration PR is merged into `dev`, not mid-branch.
- [x] **Task 7.6:** Run `pnpm dlx @bartens/bkit check` → exit 0.
- [x] **Task 7.7:** Update docs: `docs/decisions.md` (ADR), `docs/architecture.md`, `docs/knowledge.md`, `docs/pending.md` (all entries listed in § Documentation Updates). `docs/completed.md` entry deferred until full BAR-111 ships (after sibling C).
- [x] **Task 7.8:** Commit: `feat(BAR-111): consume @bartens/bkit; remove local install script`. Push, open PR to `dev`, get CI green, merge (squash).

### 🔒 Gate 2: Code Implementation Check

- [x] **Supersession Inventory TBD-path rows resolved:** Confirm every `[DELETE]` row in § Supersession Inventory whose path was "TBD by Pre-Flight Task 0.4 grep" (install script, `package.json#scripts.install:agents`, `*.bflow-version`) is either marked no-op with grep evidence in plan log, OR deletion was actually executed and recorded. No row may remain in "TBD" state.
- [x] **Phase 7 task completeness:** Every Phase 7 task above is `[x]`.
- [x] **Gate 2 - Verified:** Independently verified.

> [!IMPORTANT]
> **Testing Strategy (this sub-plan):**
>
> - No new automated tests in this sub-plan. All bkit-side tests live in sibling sub-plan A.
> - Consumer-side regression: post-`install` `git diff HEAD -- .claude .cursor .agents` empty is the gold gate (Task 7.5). Lockfile / `package.json` / deleted-script diff is expected and tracked separately (Task 7.8).
> - Existing `app-gether-life` test suite (`pnpm turbo lint typecheck format:check test`) MUST pass post-migration (CI gate before merge).

**Mandatory Tasks (Testing & Documentation):**

- [x] **Verify test coverage against Derived Test Matrix:** Both manual rows (Task 7.5 byte-parity, Task 7.4a CI red on drift) covered above.
- [x] **Update existing tests:** N/A — `app-gether-life` has no tests covering its install script today (verify via `rg 'install.*agents' **/*.test.ts`). If any exist, port to bkit-side or delete.
- [x] **Write new tests:** N/A — bkit-side coverage in sibling A.
- [x] **Verify observability:** N/A — CLI logs to stdout/stderr; no log drains.
- [x] **Update documentation:** Per § Documentation Updates rows (Task 7.7).

### 🔒 Gate 3: Testing & Documentation Check

- [x] **Docs updated:** All rows in § Documentation Updates done (except `docs/completed.md` — deferred to sibling sub-plan C's final wrap).
- [x] **Gate 3 - Verified:** All boxes above checked.

## Verification Plan

### Automated Tests

- [x] **Type Check & Lint (app-gether-life):** Existing `pnpm turbo lint typecheck format:check test` from rules.md must pass post-migration (verified by CI on the migration PR).
- [x] **Regression gate:** post-`install`, `git diff HEAD -- .claude .cursor .agents` is empty. The `package.json` / `pnpm-lock.yaml` / deleted-script diff is the migration commit's own staged content and is verified separately by Task 7.8 (not via this regression gate).

> [!IMPORTANT]
> **No Architectural Downgrades**: If you encounter build, compiler, or test errors during verification, NEVER resolve them via hot fixes or anti-patterns. Halt if stuck.

### 🔒 Gate 4: Automated Verification Confirmed (this sub-plan)

- [x] **Gate 4 (sub-plan B) - Verified:** Every checkbox above checked. Final cross-sub-plan Gate 4 lives in sibling C.

### Manual Verification

> Use `gh`, `npm`, `pnpm` CLIs. No dashboards.

- [x] **Step 1:** In `app-gether-life` post-migration: `gh pr view --web` shows green CI; `pnpm dlx @bartens/bkit check` → exit 0.
- [x] **Step 2:** PR squash-merged into `dev`. `git log dev --oneline -1` shows the squash commit.

(Manual verification of second-repo onboarding and upgrade smoke lives in sibling sub-plan C.)

---

## Plan Reviewer Notes — Concerns Flagged for Human

> [!IMPORTANT]
>
> 1. **DEFERRED — HUMAN INPUT REQUIRED:** Acceptance Scenario Narrative + Success Criteria are FALLBACK strings. Human MUST replace `⚠️ MISSING` lines in-place before Gate 1.
> 2. **Local install script path in `app-gether-life` is unverified** — assumed `scripts/install-agents.{sh,ts}` but the actual filename comes from BAR-110. Pre-Flight Task 0.4 MUST grep first; if the script doesn't exist (BAR-110 deferred), Task 7.3 collapses to a no-op — record explicitly in plan log.
> 3. **CI drift gate path TBD** — if no pre-existing workflow references the install script or `.agents/`, Task 7.4 is no-op and a follow-up is filed in `docs/pending.md`.
> 4. **`docs/completed.md` entry deferred** to sibling sub-plan C's final wrap (BAR-111 not "done" until smoke + upgrade complete).
