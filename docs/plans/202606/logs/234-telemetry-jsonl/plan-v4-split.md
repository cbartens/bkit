Verdict: PASS

<!-- verdict:end -->

<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). `{YYYYMM}` = creation month, set once at design start. Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. -->

# bkit Unified `.jsonl` Telemetry System — Master Plan Index (v4 split)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read the actual sub-plan file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in the physical sub-plan documents.

> [!IMPORTANT]
> **This is a high-level index ONLY.** It was split from `plan-v3-checked.md` (the master plan) because the master exceeded the single-session complexity threshold (30 WS tasks, ~120K estimated tokens — see `plan-complexity-check.md`). All tasks, constraints, and 🔒 Gates now live in the five sub-plans below; this index carries only context, goals, patterns, and the sub-plan dependency graph. Execute each sub-plan in dependency order.

## Context & Goals

bkit currently scatters its telemetry across markdown ledgers (`.bkit/friction.md`, `docs/pending.md`, `docs/knowledge.md`, `docs/decisions.md`) plus a per-FID `status.jsonl` event log. The `.md` ledgers conflict on merge, are painful to aggregate, and carry the recurring EOF-append-ordering footgun. There is no compliance-grading signal, no failures ledger, no deterministic workflow counters, and no cross-repo harvest/analysis.

This plan implements issue #234 — a single telemetry machine consolidating #232 (compliance grader), #183 (size↔outcome analysis), #233 (friction harvest), and #58 (workflow counters). It generalises the already-shipped per-FID `status.jsonl` machine into a family of append-only NDJSON ledgers governed by ONE canonical TypeScript codec (`bkit-telemetry.ts`), written by inline-jq close steps that mirror the codec, and read by deterministic downstream scripts (grader, counter invariant, harvest, analysis, ship-chain rollup).

The work is decomposed into five workstreams that map 1:1 onto the design's locked P1–P5 phasing. WS-1 is the root substrate; WS-2/WS-3/WS-5 each depend only on WS-1 (WS-5 additionally on the WS2-T1 CLI decision); WS-4 depends on WS-1+WS-2+WS-3. **This is a bkit-repo (self-hosting tooling) feature — there is NO application database, no API routes, no UI, and no Supabase/RLS surface.**

**Success Criteria (high-level — full testable contract lives per sub-plan):**

- Every workflow close step appends well-formed telemetry rows to the relevant `.jsonl` ledger; rows fold to current state via ONE canonical TypeScript reducer pinned by unit test, and a parity test proves an inline-jq-written row parses identically under that reducer.
- The compliance grader runs deterministic + advisory (never-gating, fail-open) over `git diff parentSha..HEAD`, surfaces violations in `ship-summary.md`, and never blocks a run because telemetry/grading failed.
- After the #58 refactor no `*_ATTEMPT` counter or `MAX_*` comparison lives in orchestrator prose (only fenced shell), all `MAX_*` live in one config, exceeding `MAX_*` cannot silently continue, and a `status.jsonl` invariant check confirms counter rows equal the count of the steps they count.
- The harvest CLI copies (never moves/truncates/writes) consumer `.bkit/*.jsonl`, deduplicates by per-`kind` composite identity, and the analysis CLI reports counts/rates/elapsed-time + the #183 size↔outcome regression — without ever mutating a consumer's files.
- The data files stay OUT of the manifest, each carries its own explicit scoped `merge=union` line (never a blanket `*.jsonl` glob), is exempt from install/mirror + slop-scan, and is committed at close with `[skip ci]`; legacy `KN-`/`DE-` refs resolve via `aliases[]` with no mass retrofit.

**Related Issues:** None _(related-issues scan returned `None.`; #232/#183/#233/#58 are closed-as-duplicate into #234 and are scope-input, not separate trackers; #230 is closed)._

## Provenance

- **Master plan (full source of truth, pre-split):** [`plan-v3-checked.md`](./plan-v3-checked.md) — retains the full Acceptance Scenario, Breaking Changes, Supersession Inventory, Architecture & Component Changes, Documentation Updates, and Rollback Strategy. Each sub-plan copies the portions relevant to its workstream.
- **Complexity check (split rationale):** [`plan-complexity-check.md`](./plan-complexity-check.md) — `Verdict: SPLIT` (30 WS tasks > 15 ceiling; ~120K tokens > 100K).

## Workstream Dependency Graph

```
WS-1 (P1) ──┬──> WS-2 (P2) ──────────┐
            ├──> WS-3 (P3) ──────────┼──> WS-4 (P4)
            └──> WS-5 (P5)           │
                  ▲                   │
WS-2 ─(WS2-T1 CLI decision)─┴─────────┘
```

- **WS-1** (substrate) has NO prerequisites and MUST land first — every other workstream reads/writes its codec, identity tuples, and exemption surface.
- **WS-2** (grader), **WS-3** (counters), **WS-5** (migration) each `Requires: WS-1 shipped to dev` and may proceed in parallel once WS-1 ships — EXCEPT that WS-5's CLI plumbing (and WS-4's) is additionally gated on WS-2's WS2-T1 entrypoint/namespace decision.
- **WS-4** (harvest+analysis) `Requires: WS-1 + WS-2 + WS-3 shipped to dev` — its analysis CLI consumes WS-2's `kind:"compliance"` rows.

## Merge Method

**Merge method: always squash.** Each workstream (sub-plan) ships as its own squash PR into `dev` via `gh pr merge --squash --delete-branch --body ""` (hardcoded in `bkit-ship.md` Step 5). Commit-boundary ordering across workstreams is preserved by SEPARATE PRs (WS-1 → then WS-2/WS-3/WS-5 in parallel → then WS-4), not by non-squash merges.

## Sub-Plan Index

<!-- prettier-ignore -->
| # | Sub-plan | Workstream | Requires | Concurrency |
| --- | --- | --- | --- | --- |
| A | [`plan-v4-1.md`](./plan-v4-1.md) | WS-1 — JSONL telemetry substrate (P1) | Nothing | Root — must land first |
| B | [`plan-v4-2.md`](./plan-v4-2.md) | WS-2 — Compliance grader (P2) | Sub-plan A shipped to dev | Concurrent with C |
| C | [`plan-v4-3.md`](./plan-v4-3.md) | WS-3 — #58 counter refactor (P3) | Sub-plan A shipped to dev | Concurrent with B |
| D | [`plan-v4-4.md`](./plan-v4-4.md) | WS-4 — Harvest + analysis (P4) | Sub-plans A + B + C shipped to dev | After A+B+C |
| E | [`plan-v4-5.md`](./plan-v4-5.md) | WS-5 — knowledge/decisions migration (P5) | Sub-plan A shipped to dev + WS2-T1 CLI decision recorded | Can begin after WS2-T1 completes (even before rest of B ships) |

### Per-sub-plan task ownership (losslessness map)

- **Sub-plan A (WS-1):** WS1-T1, WS1-T2, WS1-T3, WS1-T4, WS1-T5, WS1-T6, WS1-T7, WS1-T8, WS1-T9 + 🔒 Gate 2 (WS-1). (9 WS tasks)
- **Sub-plan B (WS-2):** WS2-T1, WS2-T2, WS2-T3, WS2-T4, WS2-T5, WS2-T6 + 🔒 Gate 2 (WS-2). (6 WS tasks)
- **Sub-plan C (WS-3):** WS3-T1, WS3-T2, WS3-T3, WS3-T4 + 🔒 Gate 2 (WS-3). (4 WS tasks)
- **Sub-plan D (WS-4):** WS4-T1, WS4-T2, WS4-T3, WS4-T4, WS4-T5 + 🔒 Gate 2 (WS-4). (5 WS tasks)
- **Sub-plan E (WS-5):** WS5-T1, WS5-T0, WS5-T2, WS5-T2b, WS5-T3, WS5-T4 + 🔒 Gate 2 (WS-5). (6 WS tasks)

Total WS tasks across sub-plans: 9 + 6 + 4 + 5 + 6 = **30** (matches master). Shared gates (Gate 1 prerequisites, Gate 3 testing/docs, Gate 4 automated verification), the Mandatory Testing & Documentation tasks, the Verification Plan, and each WS's Manual Verification step are carried into the sub-plan(s) that own them (Gate 1 → every sub-plan; Gate 3/4 + Verification Plan → every sub-plan scoped to that WS; Manual Verification Step N → the matching WS sub-plan).

## Out of Scope

- Any application database, API route, UI component, Supabase migration, RLS policy, Zod validator, or Playwright E2E — this is a self-hosting tooling change to the bkit repo.
- Mass find-replace retrofit of the ~1,460 existing `KN-`/`DE-` references — resolved via `aliases[]` + a generated committed lookup table (WS-5).
- Offline `pass^k` grader fixture tier (explicitly out of scope per locked decision #6).
- Locking / concurrency control for telemetry writes — single-clone serialisation already enforced; writes stay append-only + best-effort.
- A human-facing telemetry renderer — consumption is agent-read (per-workflow summary + analysis CLI) only.
- Auto-wiring the WS-5 migration into the `bkit upgrade` hot path (deliberately NOT an upgrade hook).

## Patterns & Cross-Cutting Constraints (apply to ALL sub-plans)

- **Canonical-source rule:** Edit `.bkit/`, `.agents/`, root config ONLY; `.claude/*`/`.cursor/*` mirrors are regenerated by the install engine, NEVER hand-edited.
- **Data files stay OUT of the manifest** (git-tracked runtime content), each gets its OWN explicit scoped `merge=union` line — NEVER a blanket `*.jsonl` glob.
- **ASCII operators** (`!=` `>=` `<=`) only in workflow/prompt files; never Unicode `≠ ≥ ≤`.
- **Best-effort idiom:** `… >> "$FILE" || echo "[bkit-telemetry] append failed: $FILE"` guarantees exit 0.
- **Fail-open idiom:** `pnpm bkit comply --phase {p} || echo "[bkit-comply] grader unavailable, skipping"` guarantees exit 0.
- **Portable ms `ts`:** emitted via `jq '… | .ts = (now*1000|floor)'` — NEVER `date +%s%3N` (BSD/macOS).
- **Boundary tests run against ground truth** (git diff, git check-attr, filesystem/consumer repo, packed-tarball, shell exit codes) — NO mocks at the boundary.
- **No commits without explicit per-wave approval**; ship each workstream as its own squash PR.
