Verdict: PASS

<!-- verdict:end -->

<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. -->

<!--
plan-complexity-split verdict: PASS
- Source: `plan-v3-checked.md` (verdict CONCERNS — translated REVISED design body, WS-1..WS-8).
- Complexity-check (`plan-complexity-check.md`) verdict: SPLIT — task count (61+/78 checkboxes) > 15 AND token estimate ~130-160K > 100K.
- Partition seams follow the WS DAG the session prompt mandated: WS-1 -> WS-2 -> WS-3 -> {WS-4, WS-5, WS-6} -> WS-7 -> WS-8. Four child sub-plans.
- Lossless: every Task 0 item, WS task, gate, WS7-7 guard sub-item, Mandatory-Task, Verification-Plan item, and Manual-Verification step from the source lands in EXACTLY ONE child. Shared CONTEXT (Context & Goals, Out of Scope, Merge Method, the relevant Supersession-Inventory slice, invariants, human-gate blockers) is repeated so each child is independently executable.
-->

# Live (Non-Mock) Testing Gates for Plan / Build / Debug — PARENT SPLIT INDEX

> [!CAUTION]
> **CRITICAL — this is the PARENT INDEX, not an executable runbook.**
>
> 1. The executable tasks, gates, and `Done when:` lines live in the FOUR child sub-plans listed below. Do NOT execute from this file.
> 2. Execute the children in DAG order. Each child names its prerequisite sub-plan(s); do NOT start a child until its prerequisites are merged.
> 3. Source of truth for execution state = the literal `[x]` vs `[ ]` checkboxes in the CHILD files, never this index and never conversation history.

**Source plan (full pre-split master):** [`plan-v3-checked.md`](./plan-v3-checked.md)
**Complexity verdict driving the split:** [`plan-complexity-check.md`](./plan-complexity-check.md) — `SPLIT` (78 runbook checkboxes > 15; ~130-160K tokens > 100K).

## Context & Goals (shared — repeated in every child)

Three runtime-only bugs (#143) shipped green because every test was mocked: the mocks asserted the world the code _assumed_, so a typmod defect, a nil-UUID injection, and a token-budget overrun all passed CI and shipped. The fix is one missing invariant, not a new subsystem:

> A test that exercises the real integration boundary must EXIST, must FAIL before a fix, and must PASS after it — and when that test cannot be run, the green result must be loud, auditable, and never silently equated with "works."

This plan installs that invariant across plan (mandate the live test exists), build (it exists and passes before a PR is raised), and debug (it fails-then-passes around a fix, with a soak loop for iterative bug chains), reusing existing bkit machinery (the `jq -e .scripts[...]` discovery seam, the `OBSERVE_MODE` axis, the diagnose->remediate->run-tests retry loop, status.json per-step verdicts). It also installs a single script-naming standard (three groups `lint:*` / `check:*` / `test:*` + umbrella aggregates) and a two-axis testing taxonomy (tier x liveness via the `LIVE_API` env flag).

**This is the parent #143 plan covering the full workstream set WS-1..WS-8.**

## The DAG (child sub-plan ordering)

```
plan-v4-1 (Task 0 + WS-1)          [atomic-or-red-CI rename; first, self-contained, mergeable alone]
        |
        v
plan-v4-2 (WS-2 + WS-3)            [taxonomy docs + capability/status.json/OBSERVE_MODE foundation]
        |
        v
plan-v4-3 (WS-4 + WS-5 + WS-6)    [plan/build/debug gates, NON-soak; WS-4/5/6 parallelisable once v4-2 merged]
        |
        v
plan-v4-4 (WS-7 + WS-8)           [soak orchestration + canonical-mirror lockstep + Gates 2/3/4 + Verification Plan / dogfood sign-off]
```

The DAG from the source: WS-1 -> WS-2 -> WS-3 -> {WS-4, WS-5, WS-6} -> WS-7 -> WS-8. Each child is one squash-merged PR (per Merge Method — decompose along WS seams rather than requesting a non-squash merge).

## Child sub-plans created

<!-- prettier-ignore -->
| Child | File | Scope | Requires (merged) |
| --- | --- | --- | --- |
| 1 | [`plan-v4-1.md`](./plan-v4-1.md) | Task 0a/0b/0c + WS1-1..WS1-8 + Gate 1 (prerequisites) + Gate WS-1. The atomic-or-red-CI rename. Carries human-gate blockers B1 (back-compat probe-both) + B2 (rename blast-radius). | — (root; first to land) |
| 2 | [`plan-v4-2.md`](./plan-v4-2.md) | WS2-1..WS2-3 (taxonomy docs + TEMPLATE ci.yml smoke job + cost-invariant guard) + WS3-1..WS3-4 (capability resolver + status.json envelope + OBSERVE_MODE foundation) + Gate WS-3. | plan-v4-1 |
| 3 | [`plan-v4-3.md`](./plan-v4-3.md) | WS4-1..WS4-3 (plan non-mock mandate) + WS5-1..WS5-3 (build empirical-verify + e2e-smoke gate + escape-hatch audit) + WS6-1..WS6-6 (debug reproduce-first + empirical-verify + escape-hatch audit, NON-soak). | plan-v4-2 |
| 4 | [`plan-v4-4.md`](./plan-v4-4.md) | WS7-1..WS7-7 (soak orchestration incl. all 18 guard sub-items) + Gate WS-7 + WS8-1..WS8-5 (canonical-mirror lockstep) + Gate 2 + Gate 3 + Gate 4 + Verification Plan + Manual Verification (dogfood sign-off). | plan-v4-3 |

## Where each source artifact landed (losslessness map)

<!-- prettier-ignore -->
| Source artifact | Child |
| --- | --- |
| Task 0a, 0b, 0c | plan-v4-1 |
| WS1-1, WS1-2, WS1-3, WS1-4, WS1-5, WS1-6, WS1-7, WS1-8 | plan-v4-1 |
| 🔒 Gate 1: Prerequisites Check | plan-v4-1 |
| 🔒 Gate WS-1: Atomic rename verified | plan-v4-1 |
| WS2-1, WS2-2, WS2-3 | plan-v4-2 |
| WS3-1, WS3-2, WS3-3, WS3-4 | plan-v4-2 |
| 🔒 Gate WS-3: Foundation verified | plan-v4-2 |
| WS4-1, WS4-2, WS4-3 | plan-v4-3 |
| WS5-1, WS5-2, WS5-3 | plan-v4-3 |
| WS6-1, WS6-2, WS6-3, WS6-4, WS6-5, WS6-6 | plan-v4-3 |
| WS7-1, WS7-2, WS7-3, WS7-4, WS7-5, WS7-6, WS7-7 (incl. all 18 guard sub-items) | plan-v4-4 |
| 🔒 Gate WS-7: No half-wired soak branch | plan-v4-4 |
| WS8-1, WS8-2, WS8-3, WS8-4, WS8-5 | plan-v4-4 |
| 🔒 Gate 2: Code Implementation Check + Mandatory Tasks (Testing & Documentation) | plan-v4-4 |
| 🔒 Gate 3: Testing & Documentation Check | plan-v4-4 |
| Verification Plan (Automated Tests) | plan-v4-4 |
| 🔒 Gate 4: Automated Verification Confirmed | plan-v4-4 |
| Manual Verification (Steps 1-3, dogfood) | plan-v4-4 |

## Cross-sub-plan dependencies (explicit)

- **plan-v4-1 -> all:** the script-naming standard (`check:type`/`check:format`/`lint`/`check`/`test`) + the `LIVE_API` flag + the B1=(a) probe-both convention are established here; every later child relies on the renamed names and probe-aliases already existing. WS1-8 owns the `.agents/workflows.md` NON-catalog discovery lines; the four `.agents/workflows.md` CATALOG rows (621/646/972/975) are deferred to plan-v4-4 (WS-8) and are an EXPECTED-and-deferred Gate-WS-1 hit, NOT a failure.
- **plan-v4-2 -> plan-v4-3 & plan-v4-4:** WS-3 introduces the `liveStack` resolver + the full status.json field/step-kind/enum envelope + the `OBSERVE_MODE = off | instrument | analyse | soak` extension + the shared-`MAX_DEBUG_ATTEMPT` semantics. Every gate task in WS-4/5/6/7 reads a field WS-3 introduced (Gate WS-3 asserts this). WS-2 (taxonomy + TEMPLATE ci.yml smoke job + cost-invariant `test`-umbrella guard) is the foundation WS-4 references for its boundary-crossing mandate.
- **plan-v4-3 -> plan-v4-4:** WS-6's `debug-reproduce` mini-step + its guard shape `(OBSERVE_MODE = off OR OBSERVE_MODE = soak) AND LIVE_STACK = live` is wired in plan-v4-3 with the soak ARM stubbed; WS-7 (plan-v4-4) widens the soak arm and adds the Step 9S soak loop. WS5-1/WS6-3 step command text + WS5-3/WS6-6 escape-hatch lines are MIRRORED verbatim by WS-8 catalog rows in plan-v4-4 — WS-8 MUST read the exact final command text WS-5/6/7 produced.
- **plan-v4-4 Gate 2/3/4 + Verification Plan:** these are whole-plan gates — they verify EVERY WS task across ALL four children is checked off and the session-end mirror regen (`dist/`, `.claude/`, `.cursor/`, snapshots) is performed ONCE. They live in the last child because they are the final sign-off after WS-8 lands.

## Invariants carried into EVERY child (do not violate)

- **`MAX_DEBUG_ATTEMPT = 3`** is the SINGLE shared cap (verified at `.agents/workflows/bkit-debug.md:38`). Soak reuses it; mint NO new constant.
- **`LIVE_API`** is the in-code env-var name (per C16) — NO `API_LIVE` residue. Surface vocab stays `live` (`:live` suffix, `@live`/`@smoke` tags, `.env.live`).
- **bkit-repo-only items** (`check:dist`, `check:bkit`, the "all `:live`/smoke ABSENT by design" declaration) sit OUTSIDE the `bkit:start/end` markers per the bkit-repo-vs-consumer scoping rule.
- **NO live test bodies** and **NO `test:smoke` / `:live` script bodies** added to bkit's OWN `package.json`; bkit declares all live scripts ABSENT by design and its live gates degrade to CONCERNS.
- **ASCII operators** (`!=` `>=` `<=`) in `.agents/workflows/*` and `.agents/prompts/*` — never Unicode `≠ ≥ ≤`.
- **No `KN-` / `BAR-` / issue-number refs** in consumer-facing text (the escape-hatch skip line, `docs/testing.md` managed block, templates).
- **MCP-only workflows** — no `gh api` / `gh` CLI / raw HTTP inside `.agents/workflows/*`.
- **#135 coordination note:** `bkit-debug-failure-diagnose.md` is ALSO edited by #135 (bounded issue-scan); do NOT assume sole ownership of that prompt.

## Out of Scope (shared — repeated in every child)

- Writing live test BODIES or adding `test:smoke` / `:live` script bodies to bkit's own `package.json`.
- Adding mocked `test:integration` / `test:e2e` to build's OWN run-tests step (build's own step is `lint check test:unit` + `test:smoke` last; CI covers the mocked tiers on the resulting PR).
- Widening Gate 4's `DIAGNOSE_VERDICT in PASS|FAIL` assertion (pre-existing narrowing; `debug-reproduce` CONCERNS rides its own step verdict).
- Issue #135 (bounded issue-scan) — orthogonal; only shared touchpoint is the `bkit-debug-failure-diagnose.md` coordination note.
- A two-way soak<->normal crossover — soak never hands back (would discard accumulating context).
- A tighter per-paid-endpoint soak-iteration cap — deferred to `docs/pending.md`.
- A future major that DROPS the legacy `typecheck`/`format:check` probe aliases — deferred to `docs/pending.md`.
- A `lint:no-tier-terms`-style CI guard that fails on an un-paired legacy script name — separate tooling issue, out of scope.

## Merge Method (shared)

**Merge method: always squash.** Plans MUST NOT propose `rebase` or `merge-commit`. Each child sub-plan lands as a SEPARATE squash-merged PR along the WS DAG — decompose into separate PRs rather than requesting a non-squash merge to preserve commit boundaries.

## Sizing summary (per-child token estimate — all <= 100K)

<!-- prettier-ignore -->
| Child | Tasks (top-level) | Gates | Est. tokens |
| --- | --- | --- | --- |
| plan-v4-1 | 3 (Task 0) + 8 (WS-1) = 11 | Gate 1, Gate WS-1 | ~55K |
| plan-v4-2 | 3 (WS-2) + 4 (WS-3) = 7 | Gate WS-3 | ~35K |
| plan-v4-3 | 3 (WS-4) + 3 (WS-5) + 6 (WS-6) = 12 | — | ~45K |
| plan-v4-4 | 7 (WS-7, incl. 18 WS7-7 sub-items) + 5 (WS-8) = 12 + 5 Mandatory-Task + 7 Verification + 3 Manual | Gate WS-7, Gate 2, Gate 3, Gate 4 | ~70K |

Total top-level runbook tasks across children = 11 + 7 + 12 + 12 = 42 (matches source: Task 0 ×3 + WS ×39 = 42), plus WS7-7's 18 discrete guard sub-items, the 5 Gate-2 Mandatory Tasks, 7 Verification-Plan Automated-Tests items, 3 Manual-Verification steps, and the 7 gates — all preserved.
