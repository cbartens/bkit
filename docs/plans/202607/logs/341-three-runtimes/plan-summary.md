Verdict: PASS

<!-- verdict:end -->

# Plan Summary

## Overview

This plan implements four-runtime support (#341) for bkit's five phase workflows (`/bkit-{design,plan,build,debug,ship}`) plus `bkit-auto`, enabling execution on laptop (mode 1), GitHub Actions runner (mode 2), claude.ai cloud session (mode 3, `CLAUDE_CODE_REMOTE=true`), and Cursor cloud agent (mode 4, promoted to scope 2026-07-23; exact detection var held for live confirmation). The approach is minimal and additive: a single runtime shim (`bkit-runtime.sh`) emits a 5-row capability table (`RUNTIME` → `CAN_WORKTREE`/`CAN_PUSH_DEV`/`CAN_SLEEP`/`GH_OK`); workflow headers branch on these flags; invariants land in `.agents/rules.md`; the close path gains transport-agnostic guards (D23/D24/D25). **Plan consists of 16 tasks (T1–T16) organized into 6 sequential sub-plans** following a dependency DAG (T1–T5 → T6–T7 → T8–T9 → T10–T13 → T14–T15 → T16). **Three pre-build decision spikes (A/B/C) have been run and closed**; findings folded into the design (design-addendum-spikes.md). The plan directly implements the settled design (verdict CONCERNS, `docs/plans/202607/341-three-runtimes-design.md`).

## Plan Quality

**Strengths:**

- Disciplined dependency DAG with explicit serialization constraints (repo forbids concurrent workflows on one clone)
- Each sub-plan is self-contained with clear "Depends on" and "Feeds" relationships
- Four successive verification gates (Prerequisites, Code Implementation, Testing & Documentation, Automated Verification) per sub-plan
- Honest about testing limits: detection + presence tested by bats/vitest; consumption verified only by live runs (design's "honest limit" D3)
- Coupled files explicitly called out with serialization notes (e.g., T7 shared with Sub-Plan 3; T10/T11 with Sub-Plan 2)
- Contingency handling for open questions: OQ-A (transport D5(a) vs D5) explicitly picks whether T12 exists; if D5 selected, T12 dropped and T13 swapped
- Spike findings (A/B/C) are folded, not re-planned

**Weaknesses & Edge Cases:**

- High discovery risk on mode 3: the first real mode-3 run (WS-16 / Sub-Plan 6) exercises all of WS-6/8/9/11/12/13/14/15; no CI pre-exercise possible (this is exactly D1's aetiology — the silent CI-suppression bug that justified the whole effort)
- Integration coupling: 13 sites in one commit for T8 (adopt-or-mint); if partial, adopt mode breaks on every step
- Three live residuals from closed spikes remain (sleep block-vs-error, which MCP server in mode 3, push_files reject-vs-clobber on moved `dev` head) — settled only by WS-16 run
- Line anchors are acknowledged as stale (verified drift: `git push origin dev` now ~:840 in ship, `core.bare` flip ~:816; no `sleep 30` at `:556`); re-grep required at build
- Design's verdict was CONCERNS (not PASS); plan inherits those concerns

## Completeness

**Coverage:**

- All 16 tasks (T1–T16) explicitly mapped to sub-plans
- Derived Test Matrix: 16 rows, one per task (rows 1–4→T3, 5–6→T7, 7–9→T9, 10→T4, 11→T1, 12→T12 conditional, 13→T5, 14–15→T16, 16→T15). No uncovered row; no duplicated row.
- Test types: bats (integration, real subprocess/git), vitest (unit + in-process integration), manual verification (@live)
- Mitigations present for all 9 design-named risks; risk window identified (mirror regen must follow any `.bkit/` source revert)

**Documentation:**

- Each sub-plan carries `Documentation Updates` rows mapped to `docs/deployments.md`, `docs/testing.md`, `docs/observability.md`, `docs/knowledge.jsonl`, `docs/decisions.jsonl`
- New test files: `tests/bkit-runtime.bats` (rows 1–9, 16), `tests/cloud-bootstrap-preflight.bats` (row 13), `.bkit/src/bkit-mcp-toolsets.test.ts` (row 10), `bkit-template-no-userpath.test.ts` (row 11), `bkit-skip-ci-subject-audit.test.ts` (row 12, conditional), `bkit-runtime-prose-audit.test.ts` (row 15)
- Batch mirror regen (`bkit install`) deferred to Sub-Plan 6 (T16) per doctrine (not after each edit)

**Architecture changes mapped:**

- [NEW] `.bkit/scripts/bkit-runtime.sh` + template (shim, capability table, GH_OK probe, Flow 1 loud-failure)
- [NEW] `runtime-resolved`, `transport-fallback`, `close-transport` row types in `status.jsonl` (additive to #234 artifact)
- [MODIFY] 8 workflow files for adopt-or-mint (T8), CI-wait migration (T7), close shapes (T10/T11/T13), skip-ci reconciliation (T12), fallback lane prose (T14), worktree helpers self-skip (T15)
- [MODIFY] `.agents/rules.md` invariants (T6), `.mcp.json` + template (T4 `actions` toolset), `cloud-bootstrap.sh` + template (T5 gh hardening), `docs/plans/template.md` (T1 no `/Users/` path)
- [DELETE] `feat/` hard-reject (T2), inline CI-dispatch kernel blocks (T7 extracted), blind CI-wait `sleep` in ship (T7)

## Acceptance Scenario

**Narrative:** A developer runs any phase (design/plan/build/debug/ship) from laptop, GitHub Actions runner, or claude.ai cloud session; the phase behaves identically in all three: starts without aborting on step 1, never yanks the session onto another branch, reliably lands work on `dev`, and completes through bounded fallback (not improvisation) when gh is unavailable. Afterwards, the run's status trail shows detected runtime, capability judgment, and which transport closed.

**Success Criteria (7):**

1. All five phases + `bkit-auto` complete end-to-end in each of the four runtimes (mode 4 = Cursor, gated on detection-var confirmation); mode-1 verified non-regressed by a real run (not rule-text-presence test).
2. No run mutates the session's checked-out branch in a runtime that cannot restore it (zero `git checkout dev` when dev-push capability is absent).
3. Every phase-close lands on `dev` with a commit/merge body free of CI-suppression tokens; `dev` CI-dispatch outcome is asserted (not assumed).
4. Any gh→MCP transition is bounded (max 1/run), recorded in `status.jsonl`, confirmed by independent re-read, cross-checked mechanically.
5. An MCP read returning empty/zero is never recorded as authoritative absence — corroborated or reported unavailable, with the corroboration attempt logged.
6. A shim that fails to source is loud and distinguishable from a correctly-detected least-capable runtime.
7. No wait can hang; every bounded poll's cap is enforced by a mechanism that survives a blocked `sleep`.

**Edge cases identified (6):**

- Identity-vs-reality mismatch (mode-2 read-only GITHUB_TOKEN; rotated GH_TOKEN 401) — transport selected by CAN_PUSH_DEV, real push certifies loudly
- Repo settings invisible to git (branch protection on `dev`; auto-delete-head-branches) — pre-close assertion on real push; dependency in `docs/deployments.md`
- Adopt mode collapses worktree isolation — accepted; existing `.lock` is only concurrency guard
- `--dry-run` probe fails dangerous (no ref-update, branch protection never evaluated) — rejected; replaced by double-guard + reversible checkout + real push
- Sleep block-vs-error in mode 3 (Bash tool blocks foreground `sleep`) — mitigated by `timeout`-wrapped cap; observable behavior settled in WS-16 live run
- `push_files` conflict inversion on moved `dev` head (branch-wins server-side vs dev-wins locally, inverse of `-X ours`) — mitigated by dev-head-unmoved precondition; reject-vs-clobber residual settled in WS-16

**Verdict on adherence to `docs/plans/template.md` § Acceptance Scenario spec:** PASS (content). Narrative present; 7 success criteria (3 from design, 4 own); 6 edge cases identified. **SC1 is aspirational pending WS-16**: "mode-1 non-regression verified by a real run, not a rule-text-presence test" depends on Sub-Plan 6 executing, which is terminal to the plan and cannot validate the design itself. Prose-only consumption verification is the design's accepted honest limit (D3).

## Breaking Changes

**API surface:**

- New `RUNTIME` flag + 4 `CAN_*` flags (additive; no collision with existing `MODE=CI|BRIEF` binding at `bkit-auto.md:70-80`)
- New `status.jsonl` row types: `runtime-resolved`, `transport-fallback`, `close-transport` (additive; existing NDJSON artifact #234)
- FID resolution reordering (D9): marker-primary → branch-fallback (already shipped in `bkit-auto.md:93-112`; only reordering above `feat/` hard-reject, which is deleted)
- `WORKTREE_PATH` becomes conditional (mint if `CAN_WORKTREE=true`, else `$REPO_ROOT`)

**Prose/user-facing:**

- Branch-naming rule reframe (D17): `rules.md:71` no longer demands FID in branch name once marker-primary FID resolution ships
- Adopt-mode workflow headers must drop `Worktree created/resumed` and `Worktree removed` gate items
- (OQ-D conditional) `[skip ci]` dropped from phase-close and intermediate status-commit subjects (D5(a) prerequisite) — docs-only closes now fire full CI instead of `run_level=none`

**Verdict:** None break existing consumers on modes 1–2; every mode-3-specific path is additive. FID resolution is a reorder (marker already exists), not a new mechanism. Breaking-Changes section adheres to template spec.

## Design Alignment

**Alignment check:**

- Plan's Acceptance Scenario narrative: "developer runs any phase from laptop/runner/cloud; behaves identically in all three" ✓ matches design § Acceptance Scenario
- Plan's success criteria (SC1–7): all 7 present; match design's `Success Criteria` section verbatim ✓
- Plan scope: all 5 phases + `bkit-auto` + 5 close transports + 2 new fallback lanes + 9 risk mitigations ✓ within design scope
- Design's 26 decisions (D1–D26) explicitly addressed: D1 (skip-token in body), D2–D3 (shim detection), D4–D5(a) (close transports), D6–D7 (worktree), D8–D25 (guards and assertions), D26 (MCP server — C1/C2 decisions from spikes folded)
- Spikes A/B/C findings folded (not re-planned as open spikes)

**Verdict:** Plan directly implements the design with no scope leakage. Design's CONCERNS verdict carries forward (inheritance, not plan's content issue). Three pre-build decision spikes settled; residual live-mode-3 items properly tracked for WS-16.

## Deferred & Out-of-Scope

All items properly categorized per the plan:

| Item                                                    | Designation                                                                                        | Rationale                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shell-native MCP CLI shim                               | Exempt (out-of-guiding-principle scope; deferred to future / lower priority)                       | New-tooling investment; best long-term shape but not "minimal, additive changes"                                                                                                                                                                                                                                  |
| Uniform PR-close in all runtimes                        | Exempt (rejected alternate in design; breaks mode-1 constraints: offline, instant, no network)     | D5(a) (PR-close) is conditional on OQ-A; D5 is fallback if human selects it                                                                                                                                                                                                                                       |
| Runtime #4 (Cursor Cloud Agent)                         | **PROMOTED TO SCOPE 2026-07-23** (was deferred) — first-class Runtime 4, mode-2-equivalent profile | Cursor is a supported provider (#75). Detection bridges the `is_background_agent` hook signal (`.cursor/hooks/preflight.sh`) to a bash-visible env marker via a bkit seam (`.cursor/environment.json` `env`); folded into T3, exact bridge + `sleep`-block held for live confirmation (verify-first, Sub-Plan 6). |
| Narrow gh read-path corroboration outside MCP           | Exempt (doctrine forbids gh for tracker ops; out of scope)                                         | MCP-internal corroboration per D12; if it proves unreliable, open separate follow-up                                                                                                                                                                                                                              |
| Root cause of MCP `search_issues` zero on private repos | Exempt (undiagnosed; logged in docs/failures.jsonl OQ3)                                            | Mitigated by D12 (mark as inconclusive, corroborate, log as distinct state); root-cause investigation deferred                                                                                                                                                                                                    |
| Periodic transport-fallback frequency summariser        | Exempt (new feature; not in design scope)                                                          | D25 gives rows a mechanical reader inside Close Workflow; analysis/aggregation deferred                                                                                                                                                                                                                           |
| Mode-tuned subagent fan-out pacing                      | Exempt (deferred per design §6g; only if hit; would fix rate-limited tight-looping)                | N2; revisit only if shared-account rate budget becomes operational concern                                                                                                                                                                                                                                        |
| `/Users/jesse` vendored skill "fix" (D20 correction)    | Exempt (creates skill-sync drift; ships no consumer defect)                                        | Kept as-is per D20; consumer-side fix if needed; not bkit's responsibility                                                                                                                                                                                                                                        |

**Verdict:** No BLOCKING deferrals. All out-of-scope items are properly exempted (genuinely-additive or outside guiding principle). No scope gaps. OQ-A and OQ-D are contingencies (alter T12/T13 if certain human choices made), not deferrals.

## Suggested Scope Expansion

None identified. Plan is tightly scoped to the design. OQ items are gating questions (required for build decisions), not expansion candidates.

## Risks

**Nine design-named risks (plan owns mitigations for 3–5):**

1. **Detection misfire** (env var absent → false `CAN_PUSH_DEV=true` → checkout on live session) — Mitigated by D23 double-guard + reversible checkout (structural, not probe accuracy)
2. **Shim load-bearing** (must be side-effect-free) — Mitigated by Flow 1 post-source assertion (distinct message for unset vs false)
3. **Blocked `sleep` hang** (produces zero observability) — Mitigated by `timeout`-wrapped caps; Spike A confirmed platform errors rather than blocks; unobservable behavior settled by live run
4. **Repo settings invisible to git** (branch protection, auto-delete-head-branches) — Mitigated by committed assertion in close path; dependency written into `docs/deployments.md`; Risk-4 is NOT a Step-1 preflight (lacks admin scope)
5. **Flag duplication** (flags set but read nowhere) — Mitigated by vitest prose audit (not behavior test; presence grep for `CAN_*` readers + foreground-sleep audit)
6. **Extra MCP calls widen lethal-trifecta surface** (prompt injection per §5a) — Adjacent to #342; D13's max-1 bound is real mitigation; no scope duplication
7. **Mode-1 non-regression** (mode 1 never exercises mode 3's path) — Mitigated by real end-to-end run (not rule-text-presence test); this is D1's exact aetiology
8. **`core.bare` flip** (laptop-specific workaround) — Decided: leave unconditional (no-op where already false; gating adds branch for zero gain)
9. **`push_files` conflict inversion** (branch-wins server-side vs dev-wins locally, opposite of `-X ours`) — Mitigated by dev-head-unmoved precondition (narrower than `-X ours`); biggest accepted risk; two transports, mode 1 never exercises mode 3, silent divergence if heads collide (settled by live run)

**Spike-owned residuals (to settle in WS-16):**

- Sleep block-vs-error (mitigated regardless by `timeout` cap)
- Which MCP server mode 3 loads + whether `GH_BKIT_TOKEN` in-sandbox (determines whether C2 lands decoupled or coupled; safe either way)
- `push_files` reject-vs-clobber on a moved `dev` head (mitigated by precondition guard; only if guard fails)

**Unknowns requiring resolution before build:**

- OQ-A: Transport choice D5(a) PR-close (recommended) vs D5 `push_files` — picks whether T12 exists
- OQ-B: Playwright artifact seam — job-logs-only fallback acceptable?
- OQ-C: `dev` branch-protection config permits autonomous close + auto-delete-head-branches enabled (human/admin action required)
- OQ-D: Docs-close CI cost (OQ-A=D5(a) consequence) — accept full CI or require skip-signal without surfacing token?

## Action Items

**For build to proceed, the following MUST be resolved:**

1. **Human confirmation of parent plan's `👤` gates (Gate 1 in Sub-Plan 1):**
   - [ ] Acceptance Scenario confirmed (parent checkbox)
   - [ ] Breaking Changes confirmed (parent checkbox)
   - [ ] Open Questions confirmed (parent checkbox)
   - Without these, Sub-Plan 1 (T1–T5) cannot start

2. **Explicit resolution of OQ-A (transport choice for D5(a) vs D5) BEFORE Sub-Plan 4:**
   - If **D5(a) PR-close** (recommended): proceed as planned; T12 exists; T13 uses PR-merge tail
   - If **D5 `push_files`**: drop T12 entirely; swap T13's tail to use `push_files` + `get_file_contents` assert + dev-head-unmoved precondition; re-verify Sub-Plan 4's matrix/runbook; drop matrix row 12
   - **Plan default:** D5(a) (uniform with ship, credential-decoupled, no payload bloat, no conflict inversion)

3. **Explicit resolution of OQ-D (docs-close CI cost, contingent on OQ-A=D5(a)) BEFORE Sub-Plan 4:**
   - If **accept full CI on docs-only closes**: proceed as planned; T12 removes `[skip ci]` from subjects; docs closes fire full CI
   - If **decline CI cost**: require D5(a) transport to carry skip signal WITHOUT surfacing token in merge subject (Failure Path back to OQ-A)
   - **Plan assumption:** OQ-D cost is accepted (same class as D11 sleep reversal, a knowing reversal)

4. **Confirmation of OQ-B (job-logs-only Playwright fallback) BEFORE Sub-Plan 5:**
   - [ ] Confirm `get_job_logs` is the standing default (failure signal not lost, rich report lost)
   - [ ] Verify `download_workflow_run_artifact` output shape against a real run (WS-16); adopt it ONLY if it carries rich report

5. **Confirmation of OQ-C (branch config) BEFORE Sub-Plan 3/6:**
   - [ ] Branch protection on `dev` permits the autonomous close (status-checks-only, no required human review)
   - [ ] "Automatically delete head branches" is enabled (there is no MCP `delete_branch` tool)
   - **Manual verification step 4 (Sub-Plan 6 / WS-16):** confirm this post-deployment

6. **Acknowledge design's honest limit (D3):**
   - Prose consumption cannot be verified by static analysis; SC1's "mode-1 non-regression verified by real run" rests entirely on WS-16
   - Three live residuals (sleep behavior, MCP server, `push_files` conflict) are mitigated structurally but final behavior settled only by live run

7. **Address design's CONCERNS verdict:**
   - Design identified 9 risks, 5 open questions, 7 success criteria; plan operationalizes mitigations
   - Plan cannot resolve design's CONCERNS → must be accepted as inherited precondition to build
   - Spikes A/B/C closed; findings folded; no further re-spikes planned

## Recommended Next Step

```
/bkit-build 341

Brief: Plan ready for build. Human must confirm parent's `👤` gates (Acceptance / Breaking / OQ-A/D/B/C) before Sub-Plan 1 starts. OQ-A (transport D5(a) vs D5) picks whether T12 exists; OQ-D (docs-close CI cost) gates scope of T12. Sub-Plans 1–5 land 16 tasks across 8 workflow files, `.agents/rules.md`, tests, and docs with explicit serialization (repo forbids concurrent workflows on one clone). Sub-Plan 6 (WS-16) is terminal: prose audit, batch mirror regen, live end-to-end runs in all four runtimes to settle four residuals (sleep block-vs-error, MCP server presence, push_files conflict, Cursor mode-4 detection-var + sleep-block). Plan directly implements design (verdict CONCERNS, docs/plans/202607/341-three-runtimes-design.md). Three pre-build spikes (A/B/C) closed; findings folded into sub-plans. See plan-v4-split.md (parent index) + six sub-plan children for full task breakdown.

Plan doc: docs/plans/202607/logs/341-three-runtimes/plan-v4-split.md
```
