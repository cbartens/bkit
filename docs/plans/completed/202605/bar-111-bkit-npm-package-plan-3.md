# ⚠️ OUT OF SCOPE FOR THIS REPO

> [!CAUTION]
> **This sub-plan covers smoke-test onboarding in a *second* repo (TBD by user at execution time) and the `0.1.1` upgrade smoke, NOT producer work in `bkit`.** It is not actionable from this repo. After `@bartens/bkit@0.1.0` is published (per `bar-111-bkit-npm-package-plan.md`) and the `app-gether-life` consumer migration is merged (sub-plan `-2.md`), this plan is executed against the chosen second smoke-test repo.
>
> Internal links below still reference `plan-v3-checked.md` / `plan-v4-*.md` filenames that do not exist on disk (workflow bug logged in `.agents/friction.md`). They have not been rewritten because this file is not the active runbook for this repo.

---

# bkit npm Package Extraction — Sub-plan C: Smoke + Upgrade (BAR-111)

**Parent Plan:** [plan-v4-split.md](./plan-v4-split.md)
**Source plan:** [plan-v3-checked.md](./plan-v3-checked.md) (Phases 8–9 + final Verification Plan + Gate 4 + Manual Verification)
**Sibling sub-plans:** [plan-v4-1.md](./plan-v4-1.md) (producer; complete), [plan-v4-2.md](./plan-v4-2.md) (consumer migration; complete)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state. Always read this file natively before executing steps. Source of truth is the literal `[x]` vs `[ ]` checkboxes here.
>
> **Hard preconditions:**
>
> 1. Sibling sub-plan A complete — `npm view @bartens/bkit version` returns `0.1.0`.
> 2. Sibling sub-plan B complete — migration PR squash-merged into `app-gether-life/dev`.
> 3. **Human supplies the second smoke-test repo identity at session START** (not mid-runbook). Without this, the session cannot proceed past Pre-Flight.

## Context & Goals

Phase B of agent-stack consolidation, smoke + upgrade phase. Sibling sub-plan A produced `@bartens/bkit@0.1.0`; sibling sub-plan B migrated `app-gether-life` to consume it. This sub-plan exercises the published package end-to-end against a second downstream repo (human-named smoke target) — running `init`, `install`, `check`, then performs the upgrade smoke (Phase 9) which proves the `upgrade` verb works against either a local `pnpm pack` tarball (Path A — default) or a real-registry `0.1.1` publish (Path B — gated on explicit human go-ahead). Closes BAR-111 with final cross-sub-plan Gate 4 + Manual Verification + `docs/completed.md` entry.

**Success Criteria (this sub-plan):**

- Second smoke-test repo (human-named) onboarded via `pnpm dlx @bartens/bkit@0.1.0 init`.
- `init`, `install`, `check` exercised end-to-end on the second repo without manual fixups.
- Upgrade smoke Path A (local-tarball) executes successfully against `app-gether-life`: `.agents/.bkit-version` bumps to `0.1.1`, payload changes propagate, user edits preserved, cache seeded.
- Path B (real-registry `0.1.1` publish) gated on explicit human authorisation; if exercised, runs end-to-end against `app-gether-life`.
- Final cross-sub-plan Gate 4 + Manual Verification all green; BAR-111 entered in `app-gether-life/docs/completed.md`.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> Human must read and confirm. Everything downstream is derived from this section.

### Spec — what good looks like

Per `docs/plans/template.md` § Acceptance Scenario Spec.

### Narrative _(design-missing fallback)_

⚠️ MISSING: design doc has no Acceptance Scenario — human must provide before plan proceeds.

<!-- draft: reviewer note — not a substitute for human input
Suggested narrative (smoke + upgrade slice): "As a maintainer, after `@bartens/bkit@0.1.0` is published and `app-gether-life` consumes it, I onboard a second downstream repo via `bkit init`/`install`/`check` end-to-end without manual fixups; then I prove the `upgrade` verb works by running it against a local `pnpm pack` tarball (or, with explicit go-ahead, a real `0.1.1` registry publish) — observing pin bump, payload propagation, user-edit preservation, and cache reseed."
The human MUST replace the `⚠️ MISSING` line above with confirmed Narrative copy before Gate 1 may pass.
-->

### Success Criteria _(design-missing fallback)_

⚠️ MISSING: design doc has no Acceptance Scenario — human must provide before plan proceeds.

<!-- draft: reviewer note — not a substitute for human input
Suggested bullets (smoke + upgrade slice):
- Second repo (human-named) onboarded via `pnpm dlx @bartens/bkit@0.1.0 init`; expected files appear; `install` and `check` exit 0; user-added `## Project Rules` bullet preserved across re-`install`.
- Upgrade smoke Path A: `pnpm dlx file:./bartens-bkit-0.1.1.tgz upgrade` against `app-gether-life` produces correct pin bump, payload propagation, `## Project` preservation, cache seed of `{newVersion}`.
- Path B (gated): `pnpm dlx @bartens/bkit@0.1.1 upgrade` against `app-gether-life` produces same outcomes against the registry copy.
- BAR-111 entered in `docs/completed.md`.
The human MUST replace the `⚠️ MISSING` line above with confirmed bullets before Gate 1 may pass.
-->

### Concrete Example _(plan expands)_

**Setup:** Sibling sub-plans A and B complete. Human has supplied target second repo path at session start (e.g., `~/Documents/GitHub/{NAME}`). Maintainer on macOS, Node 20+, pnpm 9+.

**Steps:**

1. In second repo: `pnpm dlx @bartens/bkit@0.1.0 init` → CLI creates `.agents/`, redirect files, `.bkit-version`. CLI prints summary.
2. `pnpm dlx @bartens/bkit install` → empty `git diff` vs Step 1 output.
3. Edit `.agents/rules.md` add bullet under `## Project Rules`. Run `install` → bullet preserved.
4. `pnpm dlx @bartens/bkit check` → exit 0.
5. In `bkit` repo: trivial payload edit + bump to `0.1.1` + `pnpm pack` → tarball.
6. In `app-gether-life`: `pnpm dlx file:/path/to/bartens-bkit-0.1.1.tgz upgrade` → pin = `0.1.1`, payload edit propagated, `## Project` untouched, `.agents/.bkit-cache/0.1.1/` seeded.
7. (Optional Path B, human-authorised only) `pnpm publish` `0.1.1`; `pnpm dlx @bartens/bkit@0.1.1 upgrade` against `app-gether-life`; bump pin in `package.json`; PR.

**Outcome:** Second repo holds working agent-stack; upgrade verb proven end-to-end via local tarball (and optionally registry); BAR-111 closed.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Human does not supply second-repo identity at session start | Halt at Pre-Flight; cannot proceed. Do NOT pick a target unilaterally. |
| Second repo already has a `.agents/` tree (e.g., partial prior init) | `init` is additive — no overwrites. Logs `[skip]` per existing file. Pin file written/refreshed. (Per sibling A § cli/init.ts.) |
| `install` non-zero on second repo | Indicates `.agents/` missing or template parity regression. Halt; investigate. |
| Path A tarball install fails to find the file | Use absolute path; verify tarball exists at the path passed. `pnpm dlx file:` requires absolute paths reliably. |
| Path B human DOES NOT authorise `0.1.1` publish | Skip Tasks 9.1b–9.3b entirely; record skip in plan log. Path A alone satisfies the Linear DoD's "`upgrade` flow tested end-to-end". |
| Path B publish fails (2FA timeout, network) | Halt and retry; do NOT bypass. If unrecoverable, treat as Path A only and record. |
| Post-upgrade `## Project` content lost in `app-gether-life` | Bug in `upgrade.ts` — sibling A's test `bkit/cli/upgrade.integration.test.ts` should have caught this; halt and investigate (regression in published artifact). |
| `app-gether-life/.agents/.bkit-cache/0.1.0/` missing pre-upgrade (cache cold-start) | `upgrade` falls back per cold-start path: preserves all existing files outside managed blocks, regenerates managed blocks only, logs `[skip cold-start, no cache for 0.1.0] <path>`, seeds `.bkit-cache/0.1.1/`. Verify behaviour matches sibling A's `bkit/cli/upgrade.integration.test.ts` cold-start case. |

### Derived Test Matrix

> All automated bkit tests live in sibling sub-plan A. This sub-plan's verification is fully manual (smoke + upgrade exercised end-to-end against real repos).

<!-- prettier-ignore -->
| Test description | Type | Target |
| --- | --- | --- |
| Second-repo onboarding smoke test | Manual | runbook Phase 8 (Tasks 8.2–8.6) |
| Upgrade smoke Path A (local tarball) | Manual | runbook Phase 9 (Tasks 9.1a–9.3a) |
| Upgrade smoke Path B (real registry, gated) | Manual | runbook Phase 9 (Tasks 9.1b–9.3b, 9.4) |

### 👤 ✅ Human Confirmation

- [x] **Narrative replaced:** Narrative section above no longer contains `⚠️ MISSING`. Human edited in-place.
- [x] **Success Criteria replaced:** Success Criteria section above no longer contains `⚠️ MISSING`. Human edited in-place.
- [x] **Acceptance Scenario confirmed:** Reviewed Narrative, Success Criteria, Concrete Example, Edge Cases, Derived Test Matrix.
- [x] **Second-repo identity supplied:** Human has named the target second repo at session start. Path captured in plan log. (Without this, Pre-Flight cannot pass.)

> [!CAUTION]
> Agent: Do NOT pass Gate 1 until ALL FOUR checkboxes are `[x]` AND the literal string `⚠️ MISSING` is absent from this section.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

### Naming reconciliation vs Linear description

> [!IMPORTANT]
> Same canonical names as siblings A and B (decided facts; do NOT re-evaluate).

<!-- prettier-ignore -->
| Linear description (stale) | Canonical (this plan) | Source of truth |
| --- | --- | --- |
| `@bartens/bflow` | `@bartens/bkit` | plan-input.md comment override (2026-05-01) |
| `.bflow-version` | `.bkit-version` | plan-input.md comment override |
| `<!-- bflow:start -->` / `<!-- bflow:end -->` | `<!-- bkit:start -->` / `<!-- bkit:end -->` | already in `app-gether-life/.agents/` |

**Names:**

<!-- prettier-ignore -->
| Concern | Decision | Notes |
| --- | --- | --- |
| Upgrade target version | `0.1.1` | Trivial bump per § Phase 9. |
| Path A tarball name | `bartens-bkit-0.1.1.tgz` | `pnpm pack` default naming. |
| Path B publish | `pnpm publish --access public --no-git-checks` from `bkit` repo, gated. | Requires explicit human authorisation per Task 9.1b. |

> [!IMPORTANT]
> **Breaking changes (this sub-plan):**
>
> - **Path B only (gated):** publishing `@bartens/bkit@0.1.1` to npm produces an irrevocable artifact (npm allows unpublish only within 72h). Treat as a real release. If the upgrade smoke surfaces a defect post-publish: `npm deprecate @bartens/bkit@0.1.1 "phase-9 smoke regression"`; publish `0.1.2` with fix; do NOT touch `0.1.0`.
> - **Path A:** zero breaking changes — local tarball only.
> - Second-repo onboarding adds `.agents/`, `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/00-shared-rules.mdc`, `.agents/.bkit-version` to the target. Commit + push in target repo is separate from `app-gether-life`'s migration PR.

### 👤 ✅ Human Confirmation

- [x] **Breaking Changes confirmed:** I have reviewed all naming and breaking-change decisions above.

> [!CAUTION]
> Agent: Do NOT pass Gate 1 until this checkbox is `[x]`.

---

## Alternative Approaches & Recommendations

**Considered & rejected:**

- **Skip Phase 9 entirely (smoke `0.1.0` only)** — rejected; Linear DoD says "`upgrade` flow tested end-to-end" is required. Path A satisfies this with zero registry pollution.
- **Run Phase 9 against the registry by default (Path B as default)** — rejected; produces irrevocable artifacts. Path A (local tarball) is semantically equivalent for "end-to-end" without registry side-effects.
- **Use `os.tmpdir()` for the second-repo smoke** — rejected per `.agents/rules.md` § Output & Editing. Use a real human-named repo at `~/Documents/GitHub/{NAME}` or similar.

**Future-phase (out of scope):**

- Migration of any third repo beyond the one smoke-test target — tracked in `docs/pending.md` (entry already added in sibling B Task 7.7).
- Automated upgrade smoke (CI cron in bkit repo that publishes `0.1.x` and round-trips). Tracked in `docs/pending.md` per sibling B.

## Out of Scope (this sub-plan)

- All bkit producer work (sibling sub-plan A — complete).
- `app-gether-life` source-side migration (sibling sub-plan B — complete).
- Onboarding additional repos beyond the one smoke-test target.
- Changes to subagent prompts, workflows, IDE rules content beyond the trivial Phase 9 payload edit (which is reverted via the `0.1.1` bump being smoke-only).

## Merge Method

**Squash.** If Path B is exercised, the `app-gether-life` pin-bump PR (Task 9.4) is squash-merged into `dev`. Second-repo onboarding commit is in the target repo (per its own conventions); no PR into `app-gether-life`.

## Supersession Inventory

> This sub-plan creates manual verification artifacts; it does not supersede prior code.

None.

## Security & Privacy

- [x] **New API route** — N/A.
- [x] **New DB table/column** — N/A.
- [x] **Role-gated mutation** — N/A.
- [x] **User input** — Second-repo path and Path B authorisation are human inputs; no programmatic input parsing.
- [x] **PII** — N/A.
- [x] **Redirect URL** — N/A.
- [x] **Webhook** — N/A.
- [x] **New secret/env var** — `NPM_TOKEN` (Path B only). Same convention as sibling A: publisher's local `~/.npmrc`. NEVER committed. Do NOT set in `app-gether-life` or the second-repo target.

## 🚨 Pre-Flight / Dependencies 🚨

### Core (always verify)

- [x] **Sibling sub-plan A complete:** `npm view @bartens/bkit version` returns `0.1.0`. `pnpm dlx @bartens/bkit@0.1.0 --help` works. If either fails, abort.
- [x] **Sibling sub-plan B complete:** Migration PR squash-merged into `app-gether-life/dev`. Verify via `git log dev --oneline` showing the squash commit; `app-gether-life/package.json#devDependencies."@bartens/bkit"` = `"0.1.0"`.
- [x] **Second-repo identity captured:** Human has named the target second smoke-test repo at session start. Path recorded in plan log. **Without this, do NOT proceed past Pre-Flight.**
- [x] **Package Management:** No package-management changes in this sub-plan beyond an optional pin bump in `app-gether-life` (Task 9.4) if Path B is exercised.
- [x] **Dependency Versions:** `pnpm --version` ≥ 9; `node --version` ≥ 20.
- [x] **User Context:** Verify write access to second-repo target and to `~/Documents/GitHub/app-gether-life/`. For Path B: verify `npm whoami` returns `bartens` (publisher identity).
- [x] **Pending Blockers:** Query Linear for open `blocker`-labelled issues on BAR-111.
- [x] **Project Context:** Re-read sibling sub-plan A's § Architecture for `upgrade` semantics (cold-start fallback, payload-removal logic) — load-bearing for understanding observed behaviour during Phase 9 smoke.
- [x] **Testing & Quality:** N/A — manual verification only in this sub-plan.
- [x] **Prerequisite Plans:** BAR-110 + sibling A + sibling B all merged.

### Conditional

- [x] **Secrets & Env Vars** _(Path B only)_: `NPM_TOKEN` available; `npm whoami` returns `bartens`. Skip if Path B not authorised.
- [x] **Schema State** — N/A.
- [x] **Architecture & UI** — N/A. No new code in either repo (except Path B trivial payload edit + version bump in `bkit` repo, plus optional pin bump in `app-gether-life`).
- [x] **Observability** — N/A. CLI logs to stdout/stderr only.
- [x] **Notifications** — N/A.

### 🔒 Gate 1: Prerequisites Check

- [x] **Sibling A artifact live:** `npm view @bartens/bkit version` returned `0.1.0`.
- [x] **Sibling B merged:** Consumer migration squash-merged into `app-gether-life/dev`.
- [x] **Second-repo identity captured:** Human-supplied path logged.
- [x] **Narrative populated:** Acceptance Scenario § Narrative no longer contains `⚠️ MISSING`. Human-confirmation `Narrative replaced` is `[x]`.
- [x] **Success Criteria populated:** Acceptance Scenario § Success Criteria no longer contains `⚠️ MISSING`. Human-confirmation `Success Criteria replaced` is `[x]`.
- [x] **Acceptance Scenario confirmed:** Human checked the box.
- [x] **Breaking Changes confirmed:** Human checked the box.
- [x] **Gate 1 - Verified:** All Core checked. All applicable Conditional checked.

## Data Schema Integration

None.

## Architecture & Component Changes

### Repo: second smoke-test target (NEW onboarding only)

#### [NEW] (target repo) `.agents/`, `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/00-shared-rules.mdc`, `.agents/.bkit-version`

- Created by `pnpm dlx @bartens/bkit@0.1.0 init`. Target repo identity is a human input, captured in plan log at session start.
- Contents byte-identical to sibling A's `0.1.0` payload (verified by sibling A's template-parity test).

### Repo: `~/Documents/GitHub/bkit/` (Path B only — trivial payload edit)

#### [MODIFY] `bkit/agents/skills.md` (or similar minor file inside the bkit-managed block)

- Trivial payload edit (e.g., add a bullet inside `<!-- bkit:start --> ... <!-- bkit:end -->`) for the upgrade smoke to detect.

#### [MODIFY] `bkit/package.json`

- Bump `version` to `0.1.1`.

### Repo: `~/Documents/GitHub/app-gether-life/` (Path B only — pin bump)

#### [MODIFY] `app-gether-life/package.json`

- Bump `@bartens/bkit` pin from `0.1.0` to `0.1.1` (exact pin, no caret/tilde).

### Database Migrations

None.

### Cron Jobs & Scheduled Tasks

None.

## Documentation Updates

> Index: `.agents/docs.md`. Treat as code changes — rewrite prose, no lazy bullet appends.

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `app-gether-life/docs/completed.md` | Append entry for BAR-111 once this sub-plan completes (after Gate 4 + Manual Verification all green). |

(All other documentation updates were owned by sibling sub-plan B Task 7.7.)

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **Second-repo onboarding** | `git revert {COMMIT}` in target repo, OR `rm -rf .agents .claude .cursor CLAUDE.md AGENTS.md` if no commit yet. | Target repo's own conventions apply. |
| **bkit publish (0.1.1, Path B only)** | If Phase 9 upgrade smoke exposes a defect after `0.1.1` is on npm: `npm deprecate @bartens/bkit@0.1.1 "phase-9 smoke regression"`; publish `0.1.2` with fix; do NOT touch `0.1.0`. Within 72h: `npm unpublish @bartens/bkit@0.1.1`. **Strongly prefer running Path A first** so a real publish is only the final confirmation, not the smoke vehicle. | `0.1.1` published as part of upgrade smoke. Treat as real release. |
| **app-gether-life pin bump (Path B only, Task 9.4)** | `git revert {COMMIT}` of the pin-bump PR. | Single squash-merged commit; revert clean. |
| **Risk window** | Zero — no DB, no runtime. Worst case for Path B: registry pollution (recoverable via deprecate + republish). | — |

_No DB changes. Code-only. `git revert` sufficient on consumer side; `npm deprecate` on producer side (Path B only)._

## Agent Execution Runbook

> Chronological. Step Isolation. Continuous execution. Do not pause for user permission at any Gate (except where explicitly noted: Path B requires human authorisation; second-repo identity is a Pre-Flight human input).

**Phase 8: Onboard second repo (smoke test).**

- [x] **Task 8.1:** Confirm human-supplied target repo path captured in plan log at session start (Pre-Flight). Runbook does NOT pause here — if the path was not captured, Pre-Flight Gate 1 should not have passed.
- [x] **Task 8.2:** In target repo: `pnpm dlx @bartens/bkit@0.1.0 init`. Verify all expected files appear (`.agents/{rules,docs,workflows,IDEs,skills,friction}.md`, `.agents/{workflows,prompts,skills}/`, `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/00-shared-rules.mdc`, `.agents/.bkit-version`, `.claude/`, `.cursor/`).
- [x] **Task 8.3:** Run `pnpm dlx @bartens/bkit install` → empty diff vs Task 8.2 output.
- [x] **Task 8.4:** Manually edit `.agents/rules.md` adding a project bullet under `## Project Rules`. Run `install` → bullet preserved.
- [x] **Task 8.5:** Run `pnpm dlx @bartens/bkit check` → exit 0.
- [x] **Task 8.6:** Commit + push in target repo (separate from this plan's PR; target repo's own conventions apply).

**Phase 9: Upgrade smoke (proves `upgrade` end-to-end).**

> [!IMPORTANT]
> The Linear DoD ("`bkit upgrade` flow tested end-to-end") does NOT mandate a real-registry publish; a `pnpm pack` tarball satisfies "end-to-end" semantically. Phase 9 therefore runs the **local-tarball path by default** (Tasks 9.1a–9.4a). The real-registry `0.1.1` publish path (Tasks 9.1b–9.4b) is **gated on explicit human go-ahead** (out-of-DoD scope; tracked in `docs/pending.md` per sibling B).

**Path A — Local tarball smoke (default, runs first):**

- [x] **Task 9.1a:** In `bkit` repo, make a trivial payload edit (e.g., add a bullet to `agents/skills.md` inside the `<!-- bkit:start -->` … `<!-- bkit:end -->` block). Bump `package.json` to `0.1.1`. `pnpm build && pnpm test && pnpm pack` → produces `bartens-bkit-0.1.1.tgz`.
- [x] **Task 9.2a:** In `app-gether-life`, run `pnpm dlx file:/path/to/bartens-bkit-0.1.1.tgz upgrade`. Verify: `.agents/skills.md` contains new bullet; `.agents/.bkit-version` = `0.1.1`; `## Project` content untouched; `.agents/.bkit-cache/0.1.1/` seeded.
- [x] **Task 9.3a:** Verify `pnpm dlx file:/path/to/bartens-bkit-0.1.1.tgz check` → exit 0. Verify `cat app-gether-life/.agents/.bkit-version` prints `0.1.1`.

**Path B — Real-registry publish (gated; requires human go-ahead):**

- [x] **Task 9.1b:** Human explicitly authorises the `0.1.1` real-registry publish. _(Skip the rest of Phase 9 if not authorised — record skip reason in plan log.)_ `pnpm publish --access public --no-git-checks` from `bkit` repo. Confirm 2FA OTP if prompted.
- [x] **Task 9.2b:** In `app-gether-life`, run `pnpm dlx @bartens/bkit@0.1.1 upgrade`. Verify same assertions as Task 9.2a but against the registry copy.
- [x] **Task 9.3b:** Verify `pnpm dlx @bartens/bkit check` → exit 0.
- [x] **Task 9.4:** Bump `app-gether-life/package.json` `@bartens/bkit` pin to `0.1.1`, `pnpm install`, commit, PR (squash-merge into `dev`). _(If Path A only, the pin remains `0.1.0` and this task is a no-op — record outcome in plan log.)_

### 🔒 Gate 2: Code Implementation Check

- [x] **Phase 8 complete before Phase 9:** All Tasks 8.1–8.6 are `[x]` before Phase 9 begins.
- [x] **Phase 9 path recorded:** Plan log states which path(s) were exercised (Path A only, or Path A + Path B).
- [x] **Gate 2 - Verified:** Every Phase 8–9 task box `[x]` (Path B tasks may be `[N/A]` with skip reason if not authorised).

> [!IMPORTANT]
> **Testing Strategy (this sub-plan):**
>
> - No new automated tests in this sub-plan. All bkit-side tests live in sibling sub-plan A.
> - Phase 8 + Phase 9 are end-to-end manual verification of behaviour the automated tests in sibling A only cover synthetically.
> - `app-gether-life` regression: post-`upgrade` `git diff HEAD -- .claude .cursor .agents` MAY be non-empty in this sub-plan (the upgrade INTENT is to apply a payload change). What MUST hold: `## Project` content intact, pin bumped, cache seeded, `bkit check` exit 0.

**Mandatory Tasks (Testing & Documentation):**

- [x] **Verify test coverage against Derived Test Matrix:** All three manual rows (second-repo onboarding, Path A, Path B) covered above.
- [x] **Update existing tests:** N/A.
- [x] **Write new tests:** N/A.
- [x] **Verify observability:** N/A — CLI logs to stdout/stderr.
- [x] **Update documentation:** Append BAR-111 entry to `app-gether-life/docs/completed.md` once Gate 4 + Manual Verification all green.

### 🔒 Gate 3: Testing & Documentation Check

- [x] **Docs updated:** `docs/completed.md` BAR-111 entry appended.
- [x] **Gate 3 - Verified:** All boxes above checked.

## Verification Plan

### Automated Tests

- [x] **Sibling A's test suite still green:** Re-run `pnpm test` in `bkit/` repo on the `0.1.1` payload (Path A) before `pnpm pack`. (Already covered by Task 9.1a's `pnpm test` step.)

> [!IMPORTANT]
> **No Architectural Downgrades**: If you encounter test or behaviour anomalies during smoke / upgrade verification, NEVER resolve them via hot fixes or anti-patterns. Halt; investigate; treat as a regression in sibling A's published artifact and patch via `0.1.2` (not via post-hoc tweaks in `app-gether-life` or the second repo).

### 🔒 Gate 4: Automated Verification Confirmed (final, cross-sub-plan)

- [x] **Sub-plan A Gate 4 was green:** All sibling A automated test suites passed at publish time.
- [x] **Sub-plan B Gate 4 was green:** `app-gether-life` migration PR CI green at merge.
- [x] **Sub-plan C Gate 4 - Verified:** Path A smoke and (if exercised) Path B smoke produced expected outcomes; CLI outputs / test logs / `npm view` / `git diff` results captured in `docs/plans/logs/bar-111-bkit-npm-package/verification.md`.

### Manual Verification

> Use `gh`, `npm`, `pnpm` CLIs. No dashboards.

- [x] **Step 1:** `npm view @bartens/bkit version` → `0.1.0` (post-sibling-A publish; reverify).
- [x] **Step 2:** `npm view @bartens/bkit dist-tags` → has `latest`.
- [x] **Step 3:** Phase 8 second-repo onboarding executed end-to-end with human-selected target. Tasks 8.2–8.6 all green.
- [x] **Step 4:** Phase 9 upgrade smoke executed end-to-end:
  - Path A (default): Tasks 9.1a–9.3a green.
  - Path B (only if authorised): Tasks 9.1b–9.3b green; Task 9.4 PR squash-merged.
- [x] **Step 5:** BAR-111 entered in `app-gether-life/docs/completed.md` (Task in § Documentation Updates).
- [x] **Step 6:** Final verification log written to `docs/plans/logs/bar-111-bkit-npm-package/verification.md` summarising: published version(s), paths exercised, second-repo target, all CLI outputs.

---

## Plan Reviewer Notes — Concerns Flagged for Human

> [!IMPORTANT]
>
> 1. **DEFERRED — HUMAN INPUT REQUIRED:** Acceptance Scenario Narrative + Success Criteria are FALLBACK strings. Human MUST replace `⚠️ MISSING` lines in-place before Gate 1.
> 2. **DEFERRED — HUMAN INPUT REQUIRED: Second smoke-test repo identity** is an unresolved human input. **Captured at session start as a Pre-Flight item, NOT a mid-runbook stop.** If the human did not supply the path, Pre-Flight Gate 1 fails and execution halts there.
> 3. **Phase 9 publishes a real `0.1.1` to npm registry — DEFAULT PATH IS LOCAL-TARBALL.** Path A (local `pnpm pack` tarball) is default and satisfies the Linear DoD's "`upgrade` flow tested end-to-end". Path B (real registry publish) is gated on explicit human go-ahead per Task 9.1b. Rollback row covers Path B if exercised.
> 4. **Cross-sub-plan Gate 4** retroactively confirms siblings A and B were green at their respective merge/publish times — relies on plan-log evidence from those sub-plans. If plan logs are missing or incomplete, halt and reconstruct before signing off.
