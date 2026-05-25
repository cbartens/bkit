Verdict: PASS

<!-- verdict:end -->

<!-- Note: child sub-plan 2 of 4. Split from the master per the WS DAG. -->

# Live Testing Gates — Sub-Plan 2: WS-2 Taxonomy Convention + WS-3 Capability / status.json / OBSERVE_MODE Foundation

**Parent Plan:** [`plan-v4-split.md`](./plan-v4-split.md)
**Source master:** [`plan-v3-checked.md`](./plan-v3-checked.md)
**Requires (merged):** [`plan-v4-1.md`](./plan-v4-1.md) (WS-1 atomic rename — the renamed `check:type`/`check:format`/`lint`/`check`/`test` scripts + B1=a probe-both convention + `LIVE_API` flag must exist).
**Blocks:** plan-v4-3 (WS-4/5/6 read the `liveStack` field + status.json envelope + OBSERVE_MODE enum introduced here, and WS-4 references the taxonomy), plan-v4-4 (WS-7 soak builds on the OBSERVE_MODE = soak extension introduced here).

> [!CAUTION]
> **CRITICAL — do not hallucinate plan execution state.**
>
> 1. ALWAYS read this file natively before executing any step.
> 2. NEVER trust session summaries or conversation history for completion state.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in THIS document.

## Context & Goals

Three runtime-only bugs (#143) shipped green because every test was mocked. The fix is one missing invariant: a real-boundary test must EXIST, FAIL before a fix, PASS after — and when it cannot run, the green result must be loud and auditable.

This sub-plan installs the **shared foundation** WS-4/5/6/7 all build on:

- **WS-2 — Consumer testing-taxonomy convention:** rewrite `docs/testing.md` (the canonical home) with the full tier table (Unit / Integration / E2E + `:live` variants + Smoke), the `lint`/`check`/`test` script groups, the `@live`/`@smoke` tags, and the `LIVE_API` mode flag; mint the push-only `test:smoke` job into the SEEDED TEMPLATE ci.yml; author the cost-invariant guard that a bare `pnpm test` never folds the live tiers.
- **WS-3 — Capability-resolution + status.json + OBSERVE_MODE foundation:** the `LIVE_STACK in {live, absent, off}` resolver appended to debug + build Worktree Setup; the full status.json field/step-kind/enum envelope (the shape gates downstream read); the `OBSERVE_MODE = off | instrument | analyse | soak` extension.

**Success criteria for THIS child:**

- `docs/testing.md` (+ its template) managed block carries the 6-row tier table + `LIVE_API` flag; bkit-absent note OUTSIDE the markers.
- The SEEDED TEMPLATE ci.yml carries a push-gated `test:smoke` step; a Vitest assertion proves it; the seeded `test` umbrella excludes `:live`/`test:smoke` (cost invariant).
- The `liveStack` resolver lands in BOTH workflows; the full status.json envelope + OBSERVE_MODE enum extension are documented before any gate reads them.

## Out of Scope (this child)

- Writing live test BODIES / adding `test:smoke` / `:live` bodies to bkit's own `package.json`.
- The plan/build/debug GATE logic (WS-4/5/6) — plan-v4-3.
- Soak orchestration (WS-7) and canonical-mirror catalog rows (WS-8) — plan-v4-4.
- Widening Gate 4's `DIAGNOSE_VERDICT in PASS|FAIL` assertion.

## Invariants (this child)

- `LIVE_API` is the in-code env var (per C16) — NO `API_LIVE` residue. Surface vocab stays `live`.
- bkit-repo "all `:live`/smoke ABSENT by design" note sits OUTSIDE `bkit:start/end` markers.
- The SEEDED `test` umbrella excludes `:live`/`test:smoke` (cost-blast-radius invariant — a bare `pnpm test` must NEVER hit live APIs/spend).
- NO `KN-` / `BAR-` / issue refs inside the `docs/testing.md` managed block or templates.
- ASCII operators in `.agents/workflows/*` — never Unicode.
- `MAX_DEBUG_ATTEMPT = 3` is the single shared cap (verified at `bkit-debug.md:38`); soak (introduced downstream) reuses it; no new constant. The `liveVerdict`-only-when-`liveStack==live` cross-field invariant is introduced here.

## Merge Method

**Merge method: always squash.** This child lands as ONE squash-merged PR after plan-v4-1.

## Supersession Inventory (slice relevant to this child)

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `docs/testing.md` managed-block single `Real` Tiers row | Full tier table + `lint`/`check`/`test` groups + `@live`/`@smoke` tags + `LIVE_API` flag | DELETE (replace) | The single ad-hoc live-test row is superseded by the two-axis taxonomy. |

> [!CAUTION]
> **Default = `DELETE`.** Mirrored in the WS-2 Architecture entry + the WS2-1 runbook task.

## Data Schema Changes (introduced by WS-3 — the foundation downstream reads)

status.json additions (all optional fields layered onto existing step entries — no breaking change to the existing reader). `liveStack` cross-field invariant: `liveVerdict` is only meaningful when `liveStack == "live"`.

- **ADD field `liveStack`** on `debug-worktree-setup` / `build-worktree-setup` — `live | absent | off`.
- **ADD field `repro`** on `debug-reproduce` (new), `debug-run-tests`, `build-run-tests` — `fail | pass | skip`.
- **ADD field `reproKind`** on `debug-reproduce` (new) — `functional | infra | none`.
- **ADD field `liveVerdict`** on `debug-run-tests`, `build-run-tests`, `debug-soak` — `PASS | FAIL | CONCERNS | skip`.
- **ADD field `failureSignatureMoved`** on `debug-run-tests`, `debug-reproduce`, `debug-soak` — boolean.
- **ADD field `liveReason`** on `debug-close-workflow`, `build-close-workflow` — string (consumer-neutral).
- **ADD field `soakDowngradeReason`** on `debug-worktree-setup` — string (`live-stack-unavailable`).
- **ADD field `soakIterations`** on `debug-soak` — integer.
- **ADD step kind `debug-reproduce`** — reproduce-first gate execution.
- **ADD step kind `debug-soak`** — one soak-mode pass.
- **EXTEND `OBSERVE_MODE` enum** from `off | instrument | analyse` to `off | instrument | analyse | soak`.

## Architecture & Component Changes

### WS-2 — Consumer testing-taxonomy convention

#### [MODIFY] `docs/testing.md` + `.agents/templates/docs/testing.md`

- **Existence Check:** both exist. Inside the `<!-- bkit:start -->` managed block, REPLACE the single `Real` Tiers row with the full tier table (Unit / Integration / E2E + `:live` variants + Smoke), the `lint`/`check`/`test` script groups, the `@live`/`@smoke` tags, and the `LIVE_API` mode flag — consumer-neutral, NO internal refs. Record the bkit-repo "all `:live`/smoke ABSENT by design" choice OUTSIDE the markers.

#### [MODIFY] `.agents/templates/.github/workflows/ci.yml` (SEEDED consumer ci.yml — mint the push-only smoke job)

- **Existence Check:** exists (`pnpm typecheck` ~145, `pnpm format:check` ~191, `pnpm test` ~163, `test:integration` probe ~170; NO `test:smoke` today). This is the TEMPLATE ci.yml the installer SEEDS into consumers — distinct from bkit's OWN ci.yml (renamed in plan-v4-1/WS1-4) which no-ops because bkit declares smoke ABSENT. Add a `test:smoke` step gated `if: github.event_name == 'push'` (probe `jq -e '.scripts["test:smoke"]'` -> no-op warning when absent), so the SEEDED convention actually ships. Matrix rows 7 + 8 own this. (The script renames inside this template ci.yml — `typecheck`/`format:check` -> `check:type`/`check:format` — were owned by WS1-6 as part of the atomic rename in plan-v4-1.)

#### [MODIFY] `.agents/scripts/__snapshots__/bkit-templates.content.test.ts.snap` (or template-content test) — cost-invariant guard

- **Existence Check:** the content/snapshot test exists. Author a content/snapshot assertion that the SEEDED consumer `test` umbrella body folds the MOCKED tiers (`test:unit test:integration test:e2e`) and contains NEITHER `:live` NOR `test:smoke`. The single most cost-load-bearing invariant (stops a bare `pnpm test` from spending real API money); WS1-1's `jq` check only asserts `.scripts.test` EXISTS, not that it EXCLUDES the live tiers. Matrix row 9 owns this.

### WS-3 — Capability-resolution + status.json + OBSERVE_MODE foundation

#### [MODIFY] `.agents/workflows/bkit-debug.md` (Worktree Setup, Step 2)

- **Existence Check:** exists. Append the `LIVE_STACK in {live, absent, off}` resolver after `pnpm install --frozen-lockfile` (line ~228), before the status-update sub-step (line 235-251). Read `[live=off]` from the input ARTIFACT (`debug-input-{DEBUG_ATTEMPT}.md`), then probe EXISTENCE of `test:integration:live | test:e2e:live | test:smoke` via `jq -e` (single-package) and `pnpm turbo run <task> --dry-run` (monorepo, WITH the validate-or-fallback spike). Persist `liveStack` + (when applicable) `soakDowngradeReason: live-stack-unavailable` and the soak->off downgrade onto the `debug-worktree-setup` jq object (line 248-249). Add gate-checklist item `[ ] LIVE_STACK resolved (live | absent | off)`.

#### [MODIFY] `.agents/workflows/bkit-build.md` (Worktree Setup)

- **Existence Check:** exists. Same resolver appended to build Worktree Setup; persist `liveStack` onto `build-worktree-setup`.

#### [STATUS.JSON SCHEMA] (documented in the workflow step text + summary prompts)

- The full field/step-kind/enum envelope (see Data Schema Changes) is introduced here as the shared foundation. No central schema file — the shape lives in the jq writes within the workflow steps and is read by the summary prompts; introduce the field NAMES + the `liveVerdict`-only-when-`liveStack==live` invariant + the shared-`MAX_DEBUG_ATTEMPT` semantics as the foundation other WS write to.

## Documentation Updates (this child)

> Index: `.agents/docs.md`. Treat as code changes — rewrite prose, no lazy bullet appends.

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `docs/testing.md` | Full tier table + `lint`/`check`/`test` groups + `@live`/`@smoke` tags + `LIVE_API` flag (WS-2 — the canonical home). |

## 🚨 Pre-Flight / Dependencies 🚨

- [ ] **Prerequisite Plans:** plan-v4-1 (WS-1 atomic rename) merged. The renamed scripts + B1=a probe-both convention + `LIVE_API` flag must already exist.
- [ ] **Dependency Versions:** Pinned turbo version unknown until the WS3-1 spike runs (`pnpm turbo --version`); the `--dry-run` existence-probe MUST be validated against it or fall back to `jq -e` (see WS3-1).
- [ ] **Testing & Quality:** This child REWRITES `docs/testing.md` (WS-2); align the strategy section with the new tier table.
- [ ] **Project Context:** Re-read `docs/decisions.md` (the B1=a + soak DE entries recorded in plan-v4-1).

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work through autonomously. Do not pause for user permission at any Gate.
> **Blockers:** If a task cannot be completed, create a tracker issue (label `blocker`) before stopping.
> **Step Isolation:** Complete each task fully before the next.
> **Sequencing:** WS-2 -> WS-3 (WS-3 requires WS-1 + WS-2 per the DAG). Mirror regen is BATCHED at session end.

> Every task MUST include a `**Done when:**` line.

### WS-2 — Consumer testing-taxonomy convention (Requires WS-1)

- [ ] **WS2-1 — Rewrite `docs/testing.md` managed block.** Full tier table + `lint`/`check`/`test` groups + `@live`/`@smoke` tags + `LIVE_API` flag, consumer-neutral; bkit-repo "absent by design" note OUTSIDE markers. Mirror in `.agents/templates/docs/testing.md`. **Done when:** the `<!-- bkit:start -->` block in both files contains the 6-row tier table and the `LIVE_API` flag description; no `KN-`/`BAR-` refs inside the markers; the bkit-absent note is outside the markers.
- [ ] **WS2-2 — Mint the push-only `test:smoke` job into the SEEDED TEMPLATE ci.yml + assert it.** Add a `test:smoke` step gated `if: github.event_name == 'push'` to `.agents/templates/.github/workflows/ci.yml` (probe `jq -e '.scripts["test:smoke"]'` -> no-op `::warning::` when the consumer declares no smoke script), and add/extend a `bkit-release-workflow.test.ts` + ci.yml content/snapshot assertion proving the SEEDED template carries it. This is the TEMPLATE ci.yml that ships TO consumers — distinct from bkit's OWN ci.yml (WS1-4) which no-ops because bkit declares smoke ABSENT; only the TEMPLATE proves the convention ships. Owns matrix rows 7 + 8. **Done when:** `rg -n 'test:smoke' .agents/templates/.github/workflows/ci.yml` returns a step gated `if: github.event_name == 'push'`; a Vitest assertion in `bkit-release-workflow.test.ts` (or the ci.yml content/snapshot test) asserts the seeded template carries the push-gated smoke step; `pnpm test` green.
- [ ] **WS2-3 — Author the cost-invariant guard: seeded `test` umbrella excludes `:live`/`test:smoke`.** Add a content/snapshot assertion (`bkit-templates.content.test.ts` or equivalent) that the SEEDED consumer `test` umbrella body contains `test:unit test:integration test:e2e` and contains NEITHER `:live` NOR `test:smoke`. This guards the cost-blast-radius invariant (a bare `pnpm test` must NEVER hit live APIs/spend) — WS1-1's `jq` check only asserts `.scripts.test` exists, not that it EXCLUDES the live tiers. Owns matrix row 9. **Done when:** a test asserts the seeded `test` umbrella body folds the three mocked tiers AND fails if `:live` OR `test:smoke` is ever folded in; `pnpm test` green.

### WS-3 — Capability + status.json + OBSERVE_MODE foundation (Requires WS-1, WS-2)

- [ ] **WS3-1 — Build-time spike: validate the turbo `--dry-run` existence probe.** Run `pnpm turbo --version` then test `pnpm turbo run <nonexistent-task> --dry-run` exit behaviour against the pinned version. **Done when:** EITHER the `--dry-run` exit-status reliably distinguishes present/absent tasks (documented in the step comment) OR the step falls back to the established single-package `jq -e` path + "let turbo no-op" for monorepos; the chosen path AND the resolved turbo version + observed `--dry-run` exit semantics are recorded in the workflow step text (so the fallback decision is reproducible if turbo is later bumped).
- [ ] **WS3-2 — Add `LIVE_STACK` resolver to debug Worktree Setup.** Append after `pnpm install`, before status-update; read `[live=off]` from the input artifact; probe `test:integration:live | test:e2e:live | test:smoke` existence; persist `liveStack` + soak->off downgrade + `soakDowngradeReason`. **Done when:** `bkit-debug.md` Step 2 contains the resolver shell, persists `liveStack` onto `debug-worktree-setup`, and the Gate-1/Gate-2 checklist gains `[ ] LIVE_STACK resolved (live | absent | off)`.
- [ ] **WS3-3 — Add `LIVE_STACK` resolver to build Worktree Setup.** **Done when:** `bkit-build.md` Worktree Setup contains the resolver and persists `liveStack` onto `build-worktree-setup`.
- [ ] **WS3-4 — Document the status.json envelope + OBSERVE_MODE enum extension.** Introduce field names + `debug-reproduce`/`debug-soak` step kinds + `off|instrument|analyse|soak` enum + the `liveVerdict`-only-when-`liveStack==live` invariant + shared-`MAX_DEBUG_ATTEMPT` semantics in the step text consumed downstream. **Done when:** the workflow step text + summary-prompt reads reference all eight new fields and both new step kinds; the OBSERVE_MODE enum text reads `off | instrument | analyse | soak`; AND each new field is grep-confirmed present in the modified files — `rg -n 'liveStack|repro|reproKind|liveVerdict|failureSignatureMoved|liveReason|soakDowngradeReason|soakIterations' .agents/workflows/bkit-debug.md .agents/workflows/bkit-build.md` returns hits for every field name, `rg -n 'debug-reproduce|debug-soak' .agents/workflows/bkit-debug.md` returns hits for both step kinds, and `rg -n 'off \| instrument \| analyse \| soak' .agents/workflows/bkit-debug.md` returns at least one hit (the extended enum).

### 🔒 Gate WS-3: Foundation verified

- [ ] **Resolver + schema envelope land before any gate reads them.** `liveStack` is persisted in BOTH workflows; the soak->off downgrade runs at capability-resolution time (before any guard). **Done when:** reviewed; no gate task in WS-4/5/6/7 reads a field WS-3 has not introduced.

## Hand-off to next child

On merge, plan-v4-3 (WS-4 + WS-5 + WS-6) may start. It relies on: the `liveStack` field + the full status.json envelope (`repro`, `reproKind`, `liveVerdict`, `failureSignatureMoved`, `liveReason`, `soakDowngradeReason`, `soakIterations`) + the `OBSERVE_MODE = off | instrument | analyse | soak` enum extension introduced here; the `docs/testing.md` taxonomy WS-4's boundary-crossing mandate references; the TEMPLATE ci.yml `test:smoke` job + cost-invariant guard. Mirror/snapshot regen for the WS-2/WS-3 surface is part of THIS child's session-end batch.
