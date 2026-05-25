Verdict: CONCERNS
Failures: 4

<!-- verdict:end -->

# Plan Review

Lens: Regression risk, design-coverage.

## Surface-Area Map

Verified against the live worktree files (not session memory).

**WS-1 rename — `typecheck` / `format:check` callers (grep-verified, source-of-truth files only; excluding `docs/plans/**`logs,`CHANGELOG.md`, `docs/knowledge.md`, `docs/completed.md`historical narrative, and the regenerated`dist/` `.claude/` `.cursor/` mirrors):\*\*

- Minted-key source of truth: `.agents/scripts/bkit-manifest.ts`, `.agents/scripts/bkit-modules.ts` — PLAN-ENUMERATED (WS1-2/WS1-3).
- CI / hooks: `.github/workflows/ci.yml`, `.github/workflows/release.yml`, `.husky/pre-push` (lines 18,19,21 forward-looking; lines 24-29 bkit-only `bkit check`/`check:dist`, no markers — Tier-3 seed-once), `package.json#scripts` (37,40) + `lint-staged` globs `*` (no key) — PLAN-ENUMERATED (WS1-1/WS1-4).
- Installer tests + snapshot: `bkit-manifest.test.ts`, `bkit-tiers.test.ts`, `bkit-package-json.test.ts`, `bkit-modules.integration.test.ts`, `bkit-release-workflow.test.ts`, `__snapshots__/bkit-templates.content.test.ts.snap` — PLAN-ENUMERATED (WS1-5).
- Templates: `.agents/templates/.github/workflows/ci.yml`, `.agents/templates/.husky/pre-push`, `.agents/templates/.agents/rules.md`, `.agents/templates/docs/{testing,security,deployments}.md` — PLAN-ENUMERATED (WS1-6).
- Reference docs: `docs/{technology,setup,deployments,testing,security}.md`, `.agents/rules.md`, `.agents/prompts.md`, `.agents/README.md` — PLAN-ENUMERATED (WS1-6).
- Deliberate legacy fixtures: `tests/fixtures/heavy-customised-{consumer,prepush,ci}/**` — PLAN-ENUMERATED, retained on legacy names (WS1-7).
- **Workflow / prompt DISCOVERY-SEAM callers (the `for s in typecheck test format:check ...` loops + `pnpm turbo lint typecheck test` lines) — PARTIALLY ENUMERATED. See CRITICAL-1.**
  - `.agents/workflows/bkit-debug.md`: lines 303, 493, 496, 637, 640, 746, 748 (Step 3 context-fetch; Step 6; Step 9 instrument gate; Step 11 revert gate).
  - `.agents/workflows/bkit-build.md`: lines 710, 713 (Step 13).
  - `.agents/prompts/bkit-build-plan-execute.md` (47), `bkit-build-plan-gaps-remediate.md` (49), `bkit-build-challenge-remediate.md` (46), `bkit-build-challenge-tests.md` (45), `bkit-debug-failure-remediate.md` (52), `bkit-debug-observe-instrument.md` (49), `bkit-ship-conflict-resolve.md` (56,58), `bkit-utility-compress-markdown.md` (79 — example string).
  - `.agents/workflows.md` (canonical mirror): lines 523, 636, 643, 649, 651, 972, 975 IN ADDITION to the plan's enumerated 621/646. WS-8 names 621/646/972-975/634/641-652 catalog rows but NOT 523/636/643/649/651.
  - `docs/bkit-comparison.md` (68): agent-role prose `edit -> lint/typecheck/test -> edit` (forward-looking convention mention; low-risk, NOT in plan doc list).

**WS-3/6/7 OBSERVE_MODE guard sites (grep-verified in `bkit-debug.md`):** lines 73, 140, 142-145, 176, 234, 390, 441, 487, 536, 580, 626, 694, 734, 785, **856, 894**. The plan's WS7-7 16-item table covers all EXCEPT the two inner `If OBSERVE_MODE = off` sub-sites at 856 (Close Workflow tracker issue-update) and 894 (Gate checklist). See CRITICAL-2.

**Constants:** `MAX_DEBUG_ATTEMPT = 3` confirmed at `bkit-debug.md:38` (plan cites line 38 — correct). No new constant minted. `LIVE_API` standardized (no `API_LIVE` residue in any source file — only in plan/review logs). bkit's `package.json` has NO `:live`/smoke bodies and the plan does not add them (correct, scope-respecting).

**status.json:** all eight added fields + two step kinds + the `off|instrument|analyse|soak` enum are additive optional layers on existing step entries — no breaking change to the existing reader. Correct.

## CRITICAL

**CRITICAL-1 — The atomic-rename caller set is INCOMPLETE: the workflow/prompt discovery-seam loops are not enumerated, and the B1=(a) probe-both edit is never spelled out for them. This is the #143-class silent-gate-disablement regression turned on bkit itself.**

The plan's own BLOCKER B2 claims the caller surface was grep-expanded, but the expansion stopped at the installer machinery + reference-doc _mentions_. It MISSES the live `pnpm turbo lint typecheck test` lines and the single-package `for s in typecheck test format:check lint:slop lint:prose ...` fallback loops that are the ACTUAL workflow-discovery seam B1 is about:

- `.agents/workflows/bkit-debug.md` lines 303 (Step 3 context-fetch), 493/496 (Step 6), 637/640 (Step 9 instrument gate), 746/748 (Step 11 revert gate).
- `.agents/workflows/bkit-build.md` lines 710/713 (Step 13).
- Eight `.agents/prompts/*.md`: `bkit-build-plan-execute.md`, `bkit-build-plan-gaps-remediate.md`, `bkit-build-challenge-remediate.md`, `bkit-build-challenge-tests.md`, `bkit-debug-failure-remediate.md`, `bkit-debug-observe-instrument.md`, `bkit-ship-conflict-resolve.md`, plus the `bkit-utility-compress-markdown.md` example string.

Why this is a hard regression, not a cosmetic omission:

1. WS-1 renames bkit's OWN `package.json` away from `typecheck`/`format:check` to `check:type`/`check:format`. After the rename, bkit no longer HAS a `typecheck` script.
2. These `for s in typecheck test format:check ...` loops iterate LITERAL script names (verified: `bkit-build.md:713`, `bkit-debug.md:496`). They are NOT aggregates — the plan's "fold `typecheck` into the `check` umbrella" only applies to the `pnpm turbo lint check test` aggregate path, NOT the single-package fallback, which still enumerates literal names.
3. If these loops still list only `typecheck`/`format:check` after the rename, `jq -e .scripts["typecheck"]` returns non-zero on the renamed bkit repo, the script silently no-ops, and the gate stops firing — the EXACT silent-gate-disablement the B1 rationale warns recreates #143. KN at `docs/knowledge.md:365` already records this precise failure mode (a debug subagent declaring PASS after `pnpm turbo lint typecheck test` while the real failure persists).
4. The plan's B1=(a) recommendation ("workflow discovery loops probe `check:type OR typecheck`") has NO corresponding runbook task. WS1-5 only adds a _test_ asserting back-compat probing; no WS task edits the literal `for s in` loops to list BOTH legacy + new names, and WS-8 (mirror lockstep) enumerates only the catalog rows (621/646/972-975), not these loop sites.

**Required to clear:** add explicit WS-1 (and WS-8 mirror) tasks that, for EACH discovery site above, (a) update the aggregate path `pnpm turbo lint typecheck test` -> `pnpm turbo lint check test`, and (b) update the literal `for s in ...` list to include BOTH `check:type typecheck check:format format:check` (probe-both per B1=a) — or, if B1=(b) breaking-bump is chosen, drop the legacy names everywhere in the same change. Either way these ~12 files must be in the SAME atomic change or it is red-CI / silent-gate on the first run. The `Done when` greps in WS1-4/WS1-6 are scoped to `.github`/`.husky`/`docs`/`.agents` top-level and would NOT catch a stale loop inside `.agents/prompts/**` or the non-catalog `.agents/workflows.md` lines.

**CRITICAL-2 — Two OBSERVE_MODE `= off` guard sub-sites are omitted from the WS7-7 guard table — a half-wired soak branch, the design's named top regression risk.**

The plan WS7-7 enumerates 16 guard sites and EXTENDS the Step 12 Close Workflow guard (line ~785) to `off OR instrument OR soak` so a green soak reaches Close. But INSIDE Step 12 there are two further `If OBSERVE_MODE = off`-gated sub-sites the table does not list:

- `bkit-debug.md:856` — the tracker issue-update / status-update sub-step (`11. If OBSERVE_MODE = off:`). A green soak close would SKIP the tracker issue-update + state transition to `In Review`.
- `bkit-debug.md:894` — Gate checklist item `If OBSERVE_MODE = off issue update attempted`.

Consequence: a soak run that goes green crosses the outer Step-12 guard (per WS7-7) but its issue-update silently no-ops because the inner guard still reads `= off` only — the workflow completes but the tracker is never moved to `In Review`. This is precisely a half-wired `OBSERVE_MODE` branch (an orphaned `off`-assumption guard site) that the session prompt and design flag as the top risk.

**Required to clear:** add the line-856 and line-894 sub-sites as discrete WS7-7 items, extending the issue-update guard to fire on `off OR soak` (soak green-close should update the tracker exactly as a normal-off close does; `instrument` close intentionally does not, per existing line-856 semantics). Confirm the soak-green path's expected tracker behaviour explicitly.

**CRITICAL-3 — `docs/testing.md` is REWRITTEN (managed block) but the Derived Test Matrix has no row asserting the new tier-table content survives `bkit install` to a consumer, and no row covers the back-compat discovery-probe behaviour.**

The matrix covers manifest minting, prune, seeding, ci.yml smoke job, snapshot, dist freshness, and `bkit check` drift. It does NOT have a row that exercises the load-bearing B1=(a) invariant: that a consumer still on legacy `typecheck`/`format:check` is STILL discovered/gated after the rename. WS1-5 mentions "add an assertion proving back-compat probing", and WS1-7 keeps the fixtures on legacy names, but no Derived Test Matrix row binds that assertion to a target test file. Per the rubric, a touched high-risk surface (the discovery seam that B1 exists to protect) with no matrix row is a coverage gap. The Manual-Verification Step 1 dogfood ("a legacy-named fixture is still discovered") is good but is a manual check, not an automated regression guard.

**Required to clear:** add a Derived Test Matrix row: "Workflow/installer discovery resolves a `:live`/smoke and a legacy-named consumer (`typecheck`/`format:check`) under back-compat probing -> Unit/Integration (Vitest) -> the discovery-probe test file". Bind WS1-5's back-compat assertion to it.

**CRITICAL-4 — Reference-doc + prompt caller coverage gap in the `Done when` greps will let stale callers through Gate WS-1.**

The Gate WS-1 verification grep excludes `tests/fixtures/**`, `dist/**`, `.claude/**`, `.cursor/**`, `docs/plans/**`, `CHANGELOG.md`, `docs/knowledge.md` — but its search root is implicitly the broad `\b(typecheck|format:check)\b`, which WILL still surface the eight `.agents/prompts/*.md` loops and the non-catalog `.agents/workflows.md` lines as remaining hits. The gate says "every remaining hit is a back-compat probe alias" — but under the plan as written those hits are NOT yet converted to probe-aliases (no task touches them), so a faithful executor either (a) wrongly waves them through as "aliases" or (b) is blocked at the gate with no task to satisfy it. Additionally `docs/bkit-comparison.md:68` is a forward-looking convention mention not in the plan's Documentation-Updates table. (`docs/completed.md` is correctly out — verified historical work-log narrative.)

**Required to clear:** reconcile the WS-1 task list and the Gate WS-1 grep so every non-excluded forward-looking hit has an owning task; add `docs/bkit-comparison.md` to the Documentation Updates table (or explicitly note it as historical/out-of-scope).

## OPTIONAL

- **Cite the existing KN at `docs/knowledge.md:365` in the runbook.** That KN records the exact #143-class regression this plan fixes (a debug subagent declaring PASS after `pnpm turbo lint typecheck test` while the real failure persists on integration/e2e). The plan's empirical-verify gate IS the structural fix, but the Pre-Flight only says "re-read knowledge.md"; an explicit cross-reference in WS-5/WS-6 (and the new KN-rename-atomicity entry the plan already proposes) would close the knowledge loop and prevent a future executor re-deriving the same gate. Note this KN line ALSO references `typecheck`/`format:check` in its symptom narrative — correctly left as historical narrative, no edit needed.
- **State the expected `liveVerdict`/`repro` on the soak-green Close path.** WS7-5 routes soak exhaustion to handover and "green exit -> soak-aware Close Workflow", but the plan does not say what `repro`/`liveVerdict` the green soak records before Close, nor that the fail-then-pass transition (which `debug-reproduce` seeded with `repro: fail`) is the satisfaction signal. Tightening WS7-5's `Done when` to assert the `repro: fail -> pass` transition is recorded by the final soak iteration would make the soak path's empirical-verify auditable from state, matching the non-soak Step 6 contract.
- **Add a defensive assertion that `test` never aggregates live/smoke tiers.** The design is emphatic that a bare `pnpm test` must never hit live APIs/spend. A small snapshot/content assertion on the seeded `test` umbrella (that it expands to mocked tiers only, never `:live`/`test:smoke`) would guard the cost-blast-radius invariant against a future regression. Currently only prose enforces it.
- **WS3-1 turbo `--dry-run` spike: record the pinned turbo version in the `Done when`.** The Pre-Flight notes turbo version is "unknown until the spike runs". Capturing the resolved version + the observed `--dry-run` exit semantics in the workflow step comment (not just "validated") would make the fallback decision reproducible if turbo is later bumped.

## OUT OF SCOPE

- **A future major that DROPS the legacy `typecheck`/`format:check` probe aliases.** Under B1=(a) the discovery loops carry both names indefinitely; a follow-up issue to retire the aliases once consumers have migrated belongs in `docs/pending.md`, not this plan. (The plan already defers the tighter per-paid-endpoint soak cap to pending.md — same pattern.)
- **A lint rule asserting no workflow/prompt discovery loop lists a bare legacy script name without its renamed pair.** A `lint:no-tier-terms`-style guard that fails CI if a `for s in ...` loop contains `typecheck` without `check:type` would have caught CRITICAL-1 mechanically. Worth a separate tooling issue; out of scope for #143.
- **Unifying gether's four ad-hoc flags (`TEST_REAL_APIS` etc.) onto `LIVE_API`.** The C16 addendum frames this as consumer-side dogfood work in gether's repo, explicitly out of bkit's scope (bkit ships the convention only).
- **#135 (bounded issue-scan) coordination on `bkit-debug-failure-diagnose.md`.** The plan correctly flags the shared edit as a coordination note, not a merge; no action needed here beyond not assuming sole ownership (already stated in WS6-2).
