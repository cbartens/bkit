Verdict: PASS

<!-- verdict:end -->

# Plan Summary — #143 Improved Real-World Testing for Plan/Debug Workflows

## Overview

The plan installs a single missing invariant across plan/build/debug workflows: "A test exercising the real integration boundary must exist, fail before a fix, and pass after it — and when it cannot run, the green result must be loud, auditable, and never silently equated with working."

The plan is split into 4 sequentially dependent sub-plans (one squash-merged PR each, following the WS DAG: WS-1 → WS-2+WS-3 → WS-4+WS-5+WS-6 → WS-7+WS-8):

1. **plan-v4-1 (WS-1 + Task 0):** Atomic script-naming standard rename (`typecheck` → `check:type`, `format:check` → `check:format`) + umbrella aggregates (`lint` / `check` / `test`), carrying two human-gate blockers (B1: back-compat probe-both vs breaking bump; B2: rename blast-radius to installer keys + templates + mirrors). This is the root child; every other child depends on the renamed names and `LIVE_API` flag established here.

2. **plan-v4-2 (WS-2 + WS-3):** Consumer testing-taxonomy convention (`docs/testing.md` tier table + `LIVE_API` flag + script groups) and shared runtime foundation (the `LIVE_STACK in {live, absent, off}` resolver + status.json envelope + `OBSERVE_MODE = off|instrument|analyse|soak` extension + soak→off downgrade logic at Step 2). Every downstream gate reads `liveStack` and writes the new status.json fields.

3. **plan-v4-3 (WS-4 + WS-5 + WS-6):** Plan-phase non-mock mandate (`@bkit-plan-generate` + `@bkit-plan-review-3` lens for boundary-crossing tasks), build empirical-verify gate (Step 13 appends `test:smoke` LAST + records `liveVerdict` + fail-then-pass transition + gates PR creation) with escape-hatch audit, and debug reproduce-first gate (new `debug-reproduce` mini-step with 4-outcome classifier: functional-fail → diagnose; infra-fail → CONCERNS; pass → soft CONCERNS; skip → degrade) + empirical-verify (Step 6 appends live tiers LAST + records `liveVerdict`). The `debug-reproduce` guard reads `(OBSERVE_MODE = off OR soak) AND LIVE_STACK = live` (soak arm stubbed here; wired in plan-v4-4).

4. **plan-v4-4 (WS-7 + WS-8 + Gates 2/3/4 + Verification Plan):** Soak orchestration as the fourth OBSERVE_MODE value (orchestrator entry on criteria 1–2 + `[soak]` flag override + one-way diagnose `Handoff: soak` crossover on criterion 3; looping instrument→fix→re-verify on the shared `MAX_DEBUG_ATTEMPT=3` budget; soak exhaustion routes to Failure Path; green soak routes to soak-aware Close Workflow), plus all 18 discrete OBSERVE_MODE guard-site audits to prevent a half-wired branch. WS-8 mirrors `.agents/workflows.md` catalog rows + notes exactly from WS-5/6/7 step text (anti-drift). Final gates verify every task across all four children, session-end mirror regen (`dist/`, `.claude/`, `.cursor/`), and manual dogfood verification (tarball pack → install in clean dir → install AND upgrade reconcile identically; the two INNER Step-12 grep checks on probe-both coverage).

## Plan Quality

**Well-scoped:** The design is decision-complete per C15/C16 (the full-record comment + addendum in #143); the four-child split follows the explicit WS DAG. Each child is independently executable and mergeable. Dependencies are named (plan-v4-1 blocks all others; plan-v4-2 blocks plan-v4-3 and plan-v4-4; plan-v4-3 blocks plan-v4-4).

**Dependencies clear:** The parent index (plan-v4-split.md) names all 7 gates + 4 cross-child dependency edges. The source-of-truth losslessness map verifies every Task/WS/gate/guard-sub-item from the source lands in EXACTLY one child. Gate tasks are cohesive per workstream (Gate 1 = prerequisites; Gate WS-1 = atomic rename; Gate WS-3 = foundation; Gate 2/3/4 = whole-plan sign-off). Pre-flight core checklist on plan-v4-1 flags package-management and user-context dependencies.

**Gates correct:**

- Gate 1 (plan-v4-1): human blockers B1 + B2 (both explicitly marked `[x]` required before proceeding); verification of pre-flight core items.
- Gate WS-1: back-compat probe-both + rename atomicity verified; mirrors + dist regenerated.
- Gate WS-3: `liveStack` resolver + status.json envelope + OBSERVE_MODE enum loaded by downstream gates.
- Gates 2/3/4 (plan-v4-4): whole-plan verification of every WS task across all four children; mirror regen; dogfood tarball sign-off (manual).

## Completeness

**Scope covered:** All 8 workstreams (the revised taxonomy count) are represented across 4 children. Task 0 (pre-decisions: B1 back-compat strategy, C16 flag-name finalization) lands in plan-v4-1. The four domain areas (installer TypeScript + CI/release/hooks + agent-workflows + prompts + templates + test suite + reference docs) are distributed by logical dependency, not by file. The design's two risks (half-wired `OBSERVE_MODE=soak` branch + atomic-rename red-CI) are mitigated by plan structure (WS-7-7's 18 discrete guard-site sub-items + plan-v4-1's atomic-rename gate) and the dogfood verification (Step 12's two INNER grep checks on probe-both, probe-new-only vs probe-both parity).

**Testing adequate:** Mandatory-Task block in plan-v4-4/Gate 2 asserts: (1) installer test suite green (`bkit-tiers.test.ts`, `bkit-package-json.test.ts`, etc.); (2) back-compat test present (fixtures on legacy names prove probe-both works); (3) snapshot regen fresh. Verification Plan spans: (1) Automated Tests (template ci.yml cost-invariant assertion + back-compat fixture coverage + turbo `--dry-run` validate-or-fallback-to-jq task); (2) Manual Verification (dogfood tarball pack + install in clean directory + install AND upgrade live + soak-guard smoke-read + the two INNER grep checks). Post-merge CI on the resulting PR covers the mocked tiers + the `test:smoke` job (gated on push dev/main) — once a consumer fills in the `:live`/smoke scripts.

**Docs planned:** WS-2 (plan-v4-2) authors the canonical `docs/testing.md` managed block (tier table + `LIVE_API` flag + `lint`/`check`/`test` groups). Plan-v4-4/Gate 3 (Testing & Documentation Check) verifies reference docs are accurate (`docs/decisions.md` carries DE entries for B1 + soak; `docs/pending.md` carries deferred ideas). No new file type introduced (no config files; discovery rides existing `jq -e .scripts` pattern).

## Acceptance Scenario

**Adheres to template spec:** The design's `Acceptance Scenario` (in plan-input.md lines 162–210) is split across all 4 children:

- **Narrative:** "A plan whose tasks cross an external boundary is flagged at plan-review time if it lacks a paired non-mock test task" → plan-v4-3/WS-4 (`@bkit-plan-generate` + `@bkit-plan-review-3`).
- **Success Criteria A:** "Build will not raise a PR unless the live test passes" → plan-v4-3/WS-5 (Step 13 append `test:smoke` LAST; hard-FAIL-on-live-and-failed routes into retry branch; gates Step 16→17 PR creation).
- **Success Criteria B:** "Debug must observe fail before the fix and pass after" → plan-v4-3/WS-6 (`debug-reproduce` mini-step records `repro: fail|pass`; empirical-verify gates on fail-then-pass transition).
- **Success Criteria C:** "When no live stack, gates degrade to CONCERNS, recorded in status.json and stated in close comment" → plan-v4-3/WS-5/WS-6 (escape-hatch audit on always-written summary artifact, not tracker-only).
- **Success Criteria D:** "Soak mode is selectable for unknown-cause non-functional bugs" → plan-v4-4/WS-7 (orchestrator entry + `[soak]` override; accumulating-context loop; shared budget).
- **Success Criteria E:** "No new magic-number constant; no Unicode operators; no internal refs in consumer text" → all children (invariants section of each child; WS-8 mirrors carry ASCII operators only).

**Unchecked human-confirmation gates noted as expected pre-review state, NOT downgrade triggers:**

- Plan-v4-1, Gate 1: two checkboxes for B1 (back-compat strategy) and B2 (rename blast-radius ACK) are marked unchecked (`[ ]`). This is the EXPECTED pre-build state per the caution box in plan-v4-1/§Human-Gate Blockers — the reviewer MUST pick option (a) or (b) for B1 and sign off on B2 scope. The plan is PASS-ready; building is blocked until human confirms.

## Design Alignment

**Acceptance Scenario narrative + success criteria match design doc verbatim:** Yes. The plan-input.md appends the full design-v3-organised.md (lines 155–1247), and the plan tasks are the design's Components/Flows §A–I distilled into executable checklist form. Every design decision (two-axis taxonomy, script naming, soak as 4th OBSERVE_MODE, shared `MAX_DEBUG_ATTEMPT=3`, one-way soak crossover, fail-then-pass transition recording, escape-hatch degradation, reproduce-first + empirical-verify gates, the 18 guard sites, canonical-mirror lockstep) is traced to one or more plan tasks.

**Plan scope ⊆ design scope:** Yes. The plan executes the design exactly; it does NOT overreach into out-of-scope items (writing live test bodies, adding mocked integration/e2e to build's own step, widening Gate 4, a two-way soak crossover, a tighter per-endpoint soak cap, dropping legacy probe aliases). Deferred ideas (legacy-alias retirement, per-endpoint soak iteration cap) are explicit in the Out-of-Scope section of each child and will be recorded in `docs/pending.md` at the end.

## Risks

**Unknowns & dependencies:**

1. **Turbo `--dry-run` existence probe (verify-in-build risk):** The monorepo capability-resolution path uses `pnpm turbo run test:integration:live --dry-run` to detect script existence. This is NOT an established in-repo pattern and is unverified against the repo's pinned turbo version. **Mitigation:** Plan-v4-2/WS3-1 includes an explicit "validate-or-fallback-to-`jq -e`" task (Design Risks section quotes this as "make it an explicit **validate-or-fallback-to-`jq -e` task**"). The single-package `jq -e` path is established and safe; the monorepo `--dry-run` path is the only unproven piece. This is a build-time spike, not a design blocker.

2. **Half-wired `OBSERVE_MODE=soak` branch (design's named top risk):** Adding a fourth enum value silently breaks the workflow unless every guard is updated. **Mitigation:** Plan-v4-4/WS-7-7 enumerates all 18 guard sites explicitly as discrete sub-items (Failure Path branch, Step 1 decision, diagnose crossover, Gate 1 enum, debug-input echo, Steps 4/5/6/7/8/9/10/11/12 guard updates, the new `bkit-debug-soak.md` prompt). Each is a verifiable plan task; a half-wired branch cannot ship. The canonical boundary sentence in `.agents/workflows.md` (WS8-6) prevents doc drift but does NOT enforce coverage — the per-site task list does.

3. **Atomic-rename red-CI risk:** Every caller of `typecheck`/`format:check` must be renamed in the same PR, or CI goes red / a gate silently no-ops (the #143 failure mode #2 at `docs/knowledge.md:365`). **Mitigation:** Plan-v4-1 (the root child, must land first) groups all 20+ callers (installer keys + templates + workflow discovery loops + prompts + reference docs + test fixtures) into one atomic change with a self-contained Gate WS-1 (back-compat proven; all grep sites audited). Mirrors and dist are regenerated, not hand-edited. This child is independently mergeable and blocks all others until green.

4. **Back-compat probe strategy (B1 human decision):** Current design recommends option (a): workflows probe BOTH `check:type OR typecheck` / `check:format OR format:check` in discovery loops and installer reconciliation — because bkit CANNOT rename a consumer's `package.json`. **Mitigated by:** Plan-v4-1/Task 0a explicitly pins this to a human decision (checkbox at Gate 1); the plan text favours option (a) as the recommendation but does NOT lock the choice. Option (b) is a breaking major + migration advisory, also viable.

5. **Shared `MAX_DEBUG_ATTEMPT=3` is tight for deep bug chains:** The #143 case was a 3-bug chain. A shared cap across normal+soak can be exhausted before a deep chain is fully cracked in one invocation. **Mitigated by:** Early orchestrator routing does the heavy lifting (so budget is spent on soak iterations, not wasted on a misclassified normal path), and the abort-handover carries accumulated context into a fresh invocation with a new budget of 3. Per-invocation tightness is a real limit, surfaced as an accepted trade-off in the design's Trade-offs section.

6. **Cost/credential blast radius:** Gating both debug and build on a live script can exhaust quotas under autonomous looping. **Mitigated by:** Existing retry caps + run-live-test-last ordering (cheap tiers short-circuit first). The design explicitly lists this as an Open Question (Risks § item 5); a plan-time decision may cap soak iterations more tightly for paid endpoints. This is out-of-scope for build (deferred to `docs/pending.md`).

7. **Consumer mislabeling a mock suite as a live test:** Inherent limit of consumer-agnostic enforcement — bkit cannot know which deps are external. **Mitigated by:** Stated as an accepted residual risk, not silently assumed away. The fail-then-pass status.json record catches a vacuous-pass (green without reaching the boundary), and the `reproKind: infra` classification catches credential-missing failures.

## Action Items

The plan carries no content-level CONCERNS and requires no revisions before building.

**However, Gate 1 prerequisite human confirmations (plan-v4-1) are UNCHECKED and REQUIRED before the build phase begins:**

1. **Blocker B1 — Back-compat strategy:** The human reviewer must choose and confirm in plan-v4-1/Gate 1:
   - **(a) RECOMMENDED:** Workflows probe BOTH legacy (`typecheck`, `format:check`) and new names (`check:type`, `check:format`) in discovery loops and installer reconciliation (then both survive indefinitely, deferred to a future major for legacy-alias retirement).
   - **(b) ALTERNATIVE:** Breaking major version bump + a migration advisory (consumers upgrade and migrate their scripts in the same release cycle).
   - The plan defaults to option (a) (marked RECOMMENDED in plan-v4-1/Task 0a) but does NOT lock the choice. Option (a) is safer for deployed consumers; option (b) is cleaner long-term.

2. **Blocker B2 — Rename blast-radius ACK:** The human reviewer must acknowledge (checkbox at plan-v4-1/Gate 1) that the rename is genuinely "atomic-or-red-CI" and touches:
   - Installer TypeScript source (`bkit-manifest.ts`, `bkit-modules.ts`) + `dist/` compiled output.
   - CI/release/husky workflow files + `.agents/` workflow/prompt discovery loops (20+ grep sites).
   - Consumer templates + `.claude/`/`.cursor/` mirrors (regenerated at session end).
   - Test suite + snapshot regen + reference docs.
   - The rename must land in ONE PR, or every un-migrated caller is silently left on the old name (the #143 failure mode at `docs/knowledge.md:365`).

Once both blockers are confirmed at plan-v4-1/Gate 1, the build phase can proceed with all four children in DAG order.

---

## Cross-Field Invariant Check

- **Verdict line:** `Verdict: PASS` (top of file).
- **Verdict-end marker:** Present at line 2 (`<!-- verdict:end -->`).
- **No unresolved PENDING placeholders:** All section summaries are filled; no placeholder text remains.
- **Plan structure:** 4 sequentially dependent children (plan-v4-1 → plan-v4-2 → plan-v4-3 → plan-v4-4) verified against plan-v4-split.md parent index. Losslessness map confirms every source artifact lands in exactly one child.
- **Gates named and gated:** 7 gates (Gate 1 + Gate WS-1 + Gate WS-3 + Gate 2 + Gate 3 + Gate 4 + Gate WS-7); unchecked human-confirmation gates at plan-v4-1 are expected pre-review state, not a CONCERNS trigger.
- **Success criteria traceable:** All 5 design `Acceptance Scenario` success criteria are mapped to specific plan children and workstreams.
