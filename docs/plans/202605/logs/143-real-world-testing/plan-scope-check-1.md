Verdict: CONCERNS
Failures: 3

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit. Every Agent Execution Runbook task audited for (a) bounded scope, (b) `Done when:` acceptance criteria, (c) a runnable verification step; plus matrix<->runbook bidirectional mapping, supersession-inventory completeness, and #143 scope-boundary enforcement (scaffold-only, bkit-repo-only items outside markers, deferred ideas parked not crept).

## Summary

The plan is unusually rigorous: every WS task carries a `Done when:` with a concrete grep/jq/test command, the WS7-7 guard table enumerates 18 discrete grep-verified line sites, and the Supersession Inventory has 7 rows all mirrored into Architecture + Runbook. Grep-verification spot-checks all passed: `lint:no-tier-terms`/`lint:prose`/`lint:slop` exist (WS1-1's anti-partial-`lint` caution is grounded); `typecheck`/`format:check` exist in `package.json`; the 8 discovery-seam prompts named in WS1-8 are exactly the 8 prompts that contain those names; `bkit-debug.md` lines 142-145 / 856 / 894 / 785 / 626 / 694 / 734 and `bkit-build.md` 710/713 all match the cited guard/loop sites; `MAX_DEBUG_ATTEMPT = 3` at `bkit-debug.md:38`. Scope-boundary enforcement is good: no live test BODIES are added to bkit's own `package.json`, bkit-repo-only `check:dist`/`check:bkit`/absent-live live OUTSIDE markers, and both deferred ideas (tighter soak cap, legacy-alias retirement) are parked in Out of Scope + `docs/pending.md`, not crept in.

The CONCERNS below are gaps in the matrix<->runbook mapping and one missing build task, not structural breakage. Verdict is CONCERNS (CRITICAL gaps present, recoverable via plan-update), not FAIL.

## CRITICAL

### C1 — Matrix row 9 (`test` umbrella must NEVER include `:live`/`test:smoke`) has a verification row but NO build task that writes the guarding assertion.

Derived Test Matrix row 9 ("Seeded `test` umbrella expands to MOCKED tiers only — never `:live`/`test:smoke` ... guards the cost-blast-radius invariant: a bare `pnpm test` must never hit live APIs/spend") is a Snapshot/Content assertion. This is the single most cost-load-bearing invariant in the feature (it is what stops `pnpm test` from spending real API money), yet:

- WS1-1 only requires the `test` aggregate to fold the MOCKED tiers (`jq` check is `.scripts.test` exists, not that it EXCLUDES `:live`/`test:smoke`).
- No runbook task writes the snapshot/content assertion that the seeded consumer `test` umbrella excludes `test:integration:live`/`test:e2e:live`/`test:smoke`.

The matrix row maps bidirectionally to "a task," but the only candidate (the Gate-2 "Verify test coverage against Derived Test Matrix" catch-all) is not a concrete authoring task with a `Done when:` naming THIS assertion. Add an explicit build+verify task: e.g. under WS-1 or WS-2, "Add a content/snapshot assertion that the seeded `test` umbrella body contains `test:unit test:integration test:e2e` and contains NEITHER `:live` NOR `test:smoke`." **Done when:** a test in `bkit-templates.content.test.ts` (or equivalent) asserts the exclusion and fails if a live tier is folded in.

### C2 — Matrix row 7 (seeded ci.yml `test:smoke` push-only job) and row 8 (templates content snapshot) lack a dedicated build task minting the SEEDED consumer ci.yml smoke job.

WS1-4 adds the `test:smoke` push-only step to bkit's OWN `.github/workflows/ci.yml` (`Done when: ci.yml has a test:smoke step with if: github.event_name == 'push'`). But matrix row 7's target is `bkit-release-workflow.test.ts` + the ci.yml content/snapshot test, and the WS-2 Architecture section ("the SEEDED consumer ci.yml template carries it") implies the TEMPLATE ci.yml (`.agents/templates/.github/workflows/ci.yml`) must also gain the smoke job. WS1-6 lists that template file generically ("update the `typecheck`/`format:check` mentions") but no task explicitly says "add the push-only `test:smoke` step to the TEMPLATE ci.yml" nor "assert the seeded ci.yml carries it." Rows 7 and 8 therefore have no 1:1 owning build task with a `Done when:` covering the seeded-template smoke job. Add a WS-2 (or WS-1) task: seed `test:smoke` (push-gated) into `.agents/templates/.github/workflows/ci.yml` and assert via the release-workflow/snapshot test. (This is a real gap, not cosmetic: bkit's own ci.yml smoke step no-ops because bkit declares smoke ABSENT — only the seeded TEMPLATE proves the convention ships.)

### C3 — Matrix has 12 rows but the Runbook's mocked-tier verification rows (10, 12) and the back-compat row (6) are only loosely bound; assert the bidirectional 1:1 explicitly.

Process step 8 requires rows map 1:1 (bidirectional) to verification tasks. Several matrix rows collapse onto the same WS task or onto the Gate-2 catch-all rather than a named verification task:

- Row 10 (`pnpm check:dist`) -> Verification Plan "Dist freshness" item. OK.
- Row 12 (`pnpm bkit check`) -> Verification Plan "Mirror drift" item. OK.
- Row 6 (back-compat discovery) -> WS1-5 + WS1-7 (named). OK.
- Rows 1,2,3,4,5 -> WS1-2 (build) + WS1-5 (the five test files, named). OK.
- Row 11 (`docs/testing.md` managed block content) -> WS2-1 builds, but the VERIFICATION ("existing `bkit-templates.content.test.ts`") is not called out as a task; WS2-1's `Done when:` checks block CONTENT by inspection, not by an asserting test. Bind row 11 to a content-test task or state explicitly that WS2-1's snapshot update (Gate-2 "Regenerate mirrors + snapshots") is its verification.

None of these individually breaks the plan, but the plan should make the row->task binding explicit (the matrix already annotates rows 6 and 9 with their WS binding — do the same for rows 7, 8, 11) so a future plan-verify can assert 1:1 without re-deriving it.

## OPTIONAL

- **O1 — Step-numbering ambiguity in the OBSERVE_MODE decision.** The plan calls the OBSERVE_MODE decision both "Step 1 decision" (Architecture WS-7, "line 142-145") and "Step 8 OBSERVE_MODE decision" (WS7-1 `Done when:`). Grep confirms it is list-item 8 inside Worktree Setup at lines 142-145. Harmless but an implementer chasing "Step 1" vs "Step 8" could stall; pick one label.

- **O2 — WS3-1 spike outcome can silently widen scope.** WS3-1 ("validate the turbo `--dry-run` existence probe") has a clean fallback (`jq -e` + let-turbo-no-op) and records the resolved turbo version — good. But if the spike finds `--dry-run` UNreliable, every later resolver task (WS3-2/3-3) inherits the fallback shape; the plan should note that WS3-2/3-3 must consume WS3-1's recorded decision rather than re-deciding, to avoid two divergent probe implementations.

- **O3 — WS6-6 / WS5-3 hardcode the exact consumer-facing skip strings.** Good for auditability (matches the no-internal-refs rule and the Security section's verification). Worth one extra verification: a `lint:no-tier-terms`-style or grep assertion in the test suite that the emitted skip line contains no `KN-`/`BAR-`/`#`-issue token, rather than relying on manual review at authoring time. (The plan already excludes such a mechanical guard as Out of Scope — acceptable, but flag the residual manual-review risk.)

- **O4 — Gate WS-1's "no bare legacy name without its `check:*` pair" is reviewed by human grep, not asserted by a test.** This is the exact #143-class failure mode (a discovery loop silently listing only the old name). The plan correctly parks an automated `lint:no-tier-terms`-style guard as Out of Scope, but consider at minimum a one-line CI grep in the Verification Plan (it already has "Discovery-seam rename complete" — strengthen its `Done when:` to also fail on a bare legacy name in a `for s in` loop, not only on the aggregate string).

## OUT OF SCOPE

- The plan's own deferrals are correctly parked and need no action: (a) tighter per-paid-endpoint soak-iteration cap -> `docs/pending.md`; (b) future-major retirement of the `typecheck`/`format:check` probe aliases -> `docs/pending.md`; (c) a `lint:no-tier-terms`-style CI guard that fails on an unpaired bare legacy script name -> separate tooling issue. All three are real follow-ups but correctly outside #143.

- Widening Gate 4's `DIAGNOSE_VERDICT in PASS|FAIL` assertion is correctly declared out of scope (the `debug-reproduce` CONCERNS rides its own step verdict per WS6-4 / §I). No action.

- Issue #135's shared edit to `bkit-debug-failure-diagnose.md` (WS6-2 / WS7-2) is correctly flagged as a coordination touchpoint, not owned scope. No action beyond the existing coordination note.
