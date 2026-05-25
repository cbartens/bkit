Verdict: PASS
Failures: 0

<!-- verdict:end -->

# Plan Review

Lens: Tightness, scope discipline, design-coverage.

Reviewed `plan-v1-draft.md` against `plan-input.md` (SESSION PROMPT guardrails, issue #143, the C15 full-record + C16 LIVE_API addendum, and the verbatim parent design). Cross-checked all load-bearing line references and caller-surface claims against the actual worktree. No CRITICAL items: the plan does not drift from source, expands nothing without justification, populates every template-mandated section, and every Runbook task carries a terse, codebase-verifiable `Done when`. Verdict PASS.

## CRITICAL

None.

The plan clears every blocking check:

- **Design-coverage is complete.** All eight design workstreams (WS-1..WS-8) map to a runbook section; every Components/Flows section (A-I) and every Decisions-table row is reflected in a task. Items the plan declines (config file, two-way crossover, Gate-4 widening, bkit live bodies, tighter soak cap) are recorded in `Out of Scope` with the design's own rejection rationale.
- **Scope guardrails honoured.** bkit ships scaffold/convention only: `Out of Scope` and the WARNING callout forbid live test bodies / `:live`/`test:smoke` script bodies in bkit's own `package.json`; the `Verification Plan` "Run all tests" item explicitly says do NOT run bkit's absent smoke/live scripts. The bkit-repo-only pieces (`check:dist`, `check:bkit`, the absent-live declaration) are placed OUTSIDE `bkit:start/end` markers in WS1-1, WS-2, and `.husky/pre-push` (verified lines 25/29 of pre-push sit outside the rename lines).
- **Rename is atomic with explicit caller tasks.** WS1-1..WS1-7 + Gate WS-1 enumerate every caller. I grep-verified the asserted surface against the repo and the plan's claims are accurate: `bkit-manifest.ts` `typecheck`@190 / `format:check`@251; `bkit-modules.ts` occurrences at 490/509/922/1004/1039-1043/1290-1295/1449/1473; `ci.yml` `pnpm typecheck`@63 / `pnpm format:check`@71; `.husky/pre-push` lines 18-21/25/29; `.agents/workflows.md` mirror rows @621/646/972/975. The plan's caller set is complete and matches BLOCKER B2's grep-verified expansion (installer manifest, modules, tests, snapshot, dist, templates, .claude/.cursor mirrors, reference docs, fixtures).
- **B1 back-compat is pinned, not implicit.** Task 0a records the decision as a `docs/decisions.md` DE entry; the recommended resolution (option a: probe BOTH legacy + new names) is sound and well-argued (bkit cannot rename a consumer's scripts; probe-new-only silently disables the gate on un-migrated repos, recreating the exact #143 silent-gate failure). WS1-5/WS1-7 add a back-compat assertion and keep `tests/fixtures/**` deliberately on legacy names as the proof.
- **Soak granularity preserved.** WS7-7 carries the full guard-site table as 16 discrete sub-items + the `Handoff: soak` crossover row + shared-budget accounting, gated by `Gate WS-7`. Every guard-site line reference checked against `bkit-debug.md` and matches (73, 142-145, 176, 234, 248-249, 390, 441, 487, 536, 580, 626, 694, 734, 785). `MAX_DEBUG_ATTEMPT = 3` confirmed at `bkit-debug.md:38`; Task 0b pins reuse with no new constant.
- **Mirror lockstep enforced.** WS-8 pairs each workflow-step edit (WS-5/WS-6/WS-7) with its `.agents/workflows.md` mirror row; WS-8 `Requires [WS-5, WS-6, WS-7]` so the mirror tracks final step text.
- **Turbo `--dry-run` is a validate-or-fallback task.** WS3-1 is an explicit build-time spike with a `Done when` accepting EITHER a validated `--dry-run` exit behaviour OR a documented fallback to the single-package `jq -e` path.
- **`LIVE_API` used for the in-code var; no residue.** Task 0c mandates zero `API_LIVE` in plan-authored files. I grepped the worktree: `API_LIVE` appears ONLY inside the two plan/input docs (historical C13/C14 record + the residue-flag task) — no plan task mints it. Surface vocabulary stays `live` throughout.
- **Repo conventions enforced.** ASCII operators called out on every workflow/prompt task (WS4-1, WS6-1, WS7-6, WS8-5); `Security & Privacy` + WS5-3/WS6-6 require the consumer-neutral skip line with no `KN-`/`BAR-` refs; the design/plan keep GitHub/Linear interactions MCP-only (no `gh`/HTTP introduced).

## OPTIONAL

- **`lint:no-tier-terms` is never named in the plan.** The repo `package.json` (line 43) has three `lint:*` scripts: `lint:slop`, `lint:prose`, `lint:no-tier-terms`. C14/C15 enumerate all three as the `lint` group. WS1-1 says "add `lint`/`check`/`test` aggregates" but never lists what `lint` folds. The `lint` -> all `lint:*` semantics implicitly cover it, but for the `WS1-1` `Done when` to be unambiguous, consider asserting the `lint` aggregate resolves all three (`lint:slop` + `lint:prose` + `lint:no-tier-terms`) so an implementer does not hand-write a two-script `lint` and silently drop `lint:no-tier-terms`.
- **Build single-package fallback enumerated list.** `.agents/workflows.md:621` and the `bkit-build.md` Step 13 fallback enumerate scripts explicitly (`typecheck, test, format:check, lint:slop, lint:prose`). The build run-tests tier also changes `test` -> `test:unit` per design §C. WS5-1/WS8-2 cover appending `test:smoke` and the `lint check test:unit` rename, but the `Done when` lines do not explicitly call out renaming the enumerated FALLBACK list members (`typecheck`->`check:type`, `format:check`->`check:format`, `test`->`test:unit`). Recommend tightening the WS5-1/WS8-2 `Done when` to assert the single-package fallback enumerated list is also renamed, not just the turbo path.
- **`test` -> `test:unit` is a real behaviour change in build's own step, worth a one-line callout.** Today build Step 13 runs the `test` umbrella (`bkit-build.md:710`); the plan narrows build's own step to `test:unit` (mocked integration/e2e move to CI-on-PR). This is faithful to design §C and the Decisions table, and `Out of Scope` notes it, but a reader skimming WS5-1 could miss that bkit's own build run loses the mocked integration/e2e tiers it runs today. Consider one explicit sentence in WS5-1 confirming this is intentional (CI covers them on the PR), to pre-empt a "did we accidentally drop coverage?" challenge at build-review.
- **Soak-to-off downgrade variant skip line.** §G defines TWO consumer-neutral lines (the standard skip line and the soak-downgrade variant `Soak requested but no live stack available...`). WS5-3/WS6-6 `Done when` pin only the standard line verbatim; the soak-downgrade variant line is not pinned in any `Done when`. Minor — consider adding it to WS6-6 (debug-only, since soak is debug-only) so the variant is codebase-verifiable too.

## OUT OF SCOPE

- The tighter per-paid-endpoint soak-iteration cap is correctly deferred to `docs/pending.md` (plan `Alternative Approaches`, `Out of Scope`). No action — flagged only to confirm the deferral is the right call given the design's "cap of 3 is tight for deep chains" open risk; a future plan should pick this up rather than this one.
- Issue #135 (bounded issue-scan) shares only the `bkit-debug-failure-diagnose.md` touchpoint; the plan's WS6-2 coordination note ("do not assume sole ownership") is the correct treatment. No expansion needed here.
- The residual "mislabeled mock suite declared as `:live`" limit is correctly surfaced as an accepted open risk (Edge Cases table + design Trade-offs), not papered over. bkit cannot close it; out of scope by construction.
