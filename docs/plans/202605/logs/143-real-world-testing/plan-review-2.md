Verdict: PASS
Failures: 0

<!-- verdict:end -->

# Plan Review

Lens: Dependency correctness, design-coverage.

## Summary

The plan faithfully translates the revised design body (authoritative over the stale top-of-file `Verdict: PASS`) and the C15/C16 decision record. The WS DAG is respected, every design-body deliverable maps to a task, the atomic rename is correctly sequenced, the full ~16-row OBSERVE_MODE guard table is present as discrete items with the `Handoff: soak` crossover and shared-budget accounting, the back-compat decision is resolved with a task (Task 0a, B1=a), bkit-repo-only items sit outside `bkit:start/end`, and the #135 coordination touchpoint is noted without claiming ownership. No CRITICAL dependency gaps or design-coverage omissions found. Verdict PASS.

## CRITICAL

None.

Verified clean against each rubric item:

- **WS DAG ordering.** Plan section ordering Task 0 → WS-1 → WS-2 → WS-3 → {WS-4, WS-5, WS-6} → WS-7 → WS-8 matches the session-prompt DAG and the design-body `#### Requires` declarations exactly: WS-2 `Requires [WS-1]`; WS-3 `Requires [WS-1, WS-2]`; WS-4 `Requires [WS-2]`; WS-5 `Requires [WS-3]`; WS-6 `Requires [WS-3]`; WS-7 `Requires [WS-3, WS-6]`; WS-8 `Requires [WS-5, WS-6, WS-7]`. The plan's section subtitles encode these (e.g. "WS-7 ... (Requires WS-3, WS-6)", "WS-8 ... (Requires WS-5, WS-6, WS-7)"). No fabricated edges, no missing prereqs.
- **No edge consumes a later artefact.** Every declared Requires points strictly upstream. WS-7's dependency on WS-6 is genuine and consumed: WS7-3/WS7-4 widen the WS6-1 `debug-reproduce` guard's soak arm and WS7-2 extends the WS6-2 diagnose prompt with the `Handoff: soak` verdict — the reproduce step and diagnose prompt must exist first. WS-8's dependency on WS-5/WS-6/WS-7 is consumed: WS8-1/8-2/8-3 mirror the final committed Step 6 / Step 13 command text, and WS8-4/8-5 mirror the soak step/enum from WS-7.
- **Intra-WS chronology sound.** Within each WS no task depends on a later one. WS-6 orders reproduce-step (WS6-1) → diagnose pre-condition (WS6-2) → empirical-verify Step 6 (WS6-3) → Gate-4 non-collision (WS6-4) → remediate (WS6-5) → audit (WS6-6); the fail-then-pass transition (WS6-3) correctly reads the `repro: fail` that WS6-1 records earlier. WS-7's exhaustion routing (WS7-5) reads the loop established by WS7-3.
- **No cycles.** The graph is a DAG; no back-edges.
- **Atomic rename sequencing.** WS-1 bundles the rename (WS1-1) with ALL caller updates in the same change: minted-key source of truth (WS1-2 `bkit-manifest.ts`, WS1-3 `bkit-modules.ts`), CI/release/husky callers (WS1-4), installer tests (WS1-5), templates + reference docs (WS1-6), with Gate WS-1 asserting `rg` finds no stray old-name callers. No caller is left on an old script name mid-plan: WS1-4's `Done when` requires `rg 'pnpm (typecheck|format:check)' .github/workflows .husky` to return ZERO. The session-prompt-enumerated caller list (package.json, ci.yml, release.yml, husky/lint-staged, workflows.md mirror) plus the grep-discovered expansion (B2: manifest/modules/tests/snapshot/dist/mirrors) are all present. Mirror/dist regen correctly deferred to session-end batch (per the no-per-edit-`bkit install` rule), matching the design's anti-drift note.
- **Back-compat decision resolved with a task and reflected in the chain.** Task 0a records the B1=(a) probe-both-names decision in `docs/decisions.md`; WS1-5 adds a test proving back-compat probing; WS1-7 deliberately retains `tests/fixtures/**` on legacy names to prove it; the WS-1 Gate excludes back-compat probe aliases from the "no old-name caller" assertion. The choice is consistently threaded — the dependency chain reflects the decision (Task 0 precedes WS-1, which references it).
- **bkit-repo-only items correctly placed.** `check:dist` / `check:bkit` are scoped bkit-repo-only and the "all `:live`/smoke ABSENT by design" declaration is repeatedly placed OUTSIDE `bkit:start/end` (WS1-1, WS2-1 `Done when` explicitly "the bkit-absent note is outside the markers"; Out of Scope; Verification Plan "do NOT attempt to run them"). Not entangled with consumer-facing tasks.
- **#135 coordination noted, no ownership assumed.** WS6-2 carries "(Note #135 shared edit.)"; Out of Scope states "Do NOT assume sole ownership of that prompt." Matches C16 + the session prompt.

### Design-coverage cross-check (every design-body deliverable → task)

- Taxonomy (two axes + curated smoke, `LIVE_API` mode flag) → WS2-1; tier table in Derived Test Matrix + Documentation Updates.
- Naming standard (three groups + umbrella aggregates, renames) → WS1-1..WS1-6.
- Capability resolution / status.json envelope / OBSERVE_MODE foundation → WS3-2 (debug resolver), WS3-3 (build resolver), WS3-4 (schema envelope + enum), with the turbo `--dry-run` verify-in-build spike as an explicit WS3-1 validate-or-fallback task (matches Risks).
- Plan-phase mandate → WS4-1 (generate), WS4-2 (review-3 lens, `mock-only-coverage`), WS4-3 (workflow scope).
- Build empirical-verify / e2e-smoke gate / escape-hatch audit → WS5-1 (smoke last), WS5-2 (liveVerdict + gate PR), WS5-3 (audit + skip line).
- Debug reproduce-first / empirical-verify / audit → WS6-1..WS6-6, including the §I Gate-4 non-collision (WS6-4) and the reproduce-first diagnose pre-condition (WS6-2).
- Soak mode → WS7-1..WS7-7 (covered in detail below).
- Canonical mirrors → WS8-1..WS8-5, including the single OBSERVE-vs-SOAK boundary sentence (WS8-5).

No design-body element is left without a corresponding task.

### Soak coverage (the design's named top risk) — fully wired

The full §D guard table is present as discrete items in WS7-7, and every row of the design's §D table is accounted for:

- Failure Path branch (line 73), Step 1 decision (142-145), `Handoff: soak` crossover (new), Gate 1 enum widen (line 176), debug-input echo (no-change), worktree-setup persist + soak->off downgrade (248-249), Step 4/5/6 KEEP-`off` (390/441/487), Step 7/8 KEEP-`off`+Step-5-PASS (536/580), Step 9/10/11 KEEP-instrument/analyse (626/694/734), Step 12 Close EXTEND to `off OR instrument OR soak` (785), and the new Step 9-soak gate. Sixteen sub-items, each independently `Done when`-verified; Gate WS-7 asserts all sixteen.
- The `Handoff: soak` crossover (WS7-2) and shared-budget accounting (`MAX_DEBUG_ATTEMPT` = 3, verified at `bkit-debug.md:38`; no new constant) are present in WS7-2/WS7-3 and Task 0b records the budget decision.
- The soak->off downgrade is correctly placed in WS-3 (capability resolution, before any guard), matching the design's mandate that it run before any OBSERVE_MODE guard — not deferred into WS-7.
- The reproduce-first soak arm (vacuous-pass closure) is wired: WS7-4 confirms the WS6-1 guard reads `(OBSERVE_MODE = off OR OBSERVE_MODE = soak) AND LIVE_STACK = live` and short-circuits soak on `repro: pass`/`infra`.
- I verified the cited line anchors against `.agents/workflows/bkit-debug.md`: `MAX_DEBUG_ATTEMPT = 3` (line 38), Failure Path branch (73), Step 1 decision (142-145), and the OBSERVE_MODE guards at 390/441/487/536/580/626/694/734/785 all match the plan's and design's references exactly. The line anchors are accurate, not fabricated.

## OPTIONAL

- **"Step 9-soak" label collides with the existing Step 9.** The live workflow already has `## 🤖 Step 9 — Observe Instrument` (`bkit-debug.md:624`). The plan (WS7-3, WS7-7, WS8-4) and the design §D both call the new soak block "Step 9-soak" while keeping Observe Instrument at Step 9 — so plan and design AGREE (no drift), but the shared "Step 9" prefix invites an implementer to renumber or overwrite the wrong block. Suggest the implementer adopt an unambiguous heading (e.g. "Step 9S — Soak Loop" or "Step 13 — Soak") and state explicitly that Observe Instrument retains its number. This is a readability/anti-footgun note, not a dependency gap.
- **Task 0c (flag-name confirmation) has no downstream consumer edge.** Task 0c greps for `API_LIVE` residue; it is a guardrail rather than an artefact other tasks consume. Harmless, but consider folding it into the WS-1/WS-2 `Done when` (which already mandate `LIVE_API`) to avoid a dangling pre-task.
- **WS3-1 spike outcome feeds WS3-2/WS3-3 but the edge is implicit.** The turbo `--dry-run` validate-or-fallback result determines the resolver shell that WS3-2/WS3-3 write. The ordering is correct (WS3-1 first within WS-3), but making "WS3-2/WS3-3 consume the WS3-1 decision" explicit in their `Done when` would harden the intra-WS edge.
- **Build-vs-debug live-tier asymmetry is correct but easy to mis-implement.** Build Step 13 appends only `test:smoke` (no mocked integration/e2e in its own step; CI covers on PR), while debug Step 6 appends `test:integration:live test:e2e:live` after the full mocked set. The plan states this correctly in WS5-1/WS6-3 and the mirrors WS8-1/WS8-2; flagging only because a single wrong copy-paste here would silently diverge build from debug.

## OUT OF SCOPE

- **Per-paid-endpoint soak-iteration cap tighter than `MAX_DEBUG_ATTEMPT`.** Correctly deferred by the plan to `docs/pending.md` (Alternative Approaches; Risks open question). Not applied here.
- **Widening Gate 4's `DIAGNOSE_VERDICT in PASS|FAIL` assertion.** Pre-existing narrowing; the plan correctly routes the `debug-reproduce` CONCERNS via its own step verdict (WS6-4) rather than widening Gate 4. Out of scope by design.
- **Writing live test bodies / adding `test:smoke` bodies to bkit's own `package.json`.** Correctly out of scope (bkit declares live ABSENT by design); the plan does not propose any such task.
