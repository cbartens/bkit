Verdict: CONCERNS
Failures: 1

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit.

Plan audited: `docs/plans/202610/logs/699-engine-run-completeness/plan-v1-draft.md` — 8 groups, 15 tasks, 29 `Derived Test Matrix` rows, 5 `Success Criteria`.

Read: `plan-input-1.md` (§ Session Prompt, § Issue description, § Design — Acceptance Scenario, Key Edge Cases, Reuse & Prior Art, Suggested Workstreams WS-1…WS-8), `related-issues.md`, `related-deferrals.md`, `related-failures.md` (`None.`), `docs/templates/bkit-plan.md`, `.bkit/trackers.md` § Issue shapes, `package.json` `bkit.workflows.tasks`, `.bkit/core/engine/install/manifest.ts`, and every artifact the plan names.

Verified clean (no finding raised): template sections all present and populated; `Narrative` and `Success Criteria` word for word from the design's `## Acceptance Scenario`; `Process Sketch` 7 outcome lines restating the `Concrete Example` and `Edge Cases` with no new example; the design's 10 Key Edge Cases kept word for word plus 6 plan-added rows; `Derived Test Matrix` ↔ `Agent Execution Runbook` **1:1 in both directions** (each of the 29 rows maps to exactly one task, and each of the 23 task `TEST FIRST` entries maps to a row); every task carries scope, `DONE WHEN` and tests or an `n/a — {reason}`; group caps respected (≤3 tasks, ≤15 tests per group; ≤10 tests across ≤3 files per task); every existing file, symbol and line reference the plan names exists; `Supersession Inventory` present with its `[DELETE]` mirror; `Reuse Inventory` 20 rows, every `NEW` citing (a)/(b) and every `[NEW]` / `CREATE` file traced; `Out of Scope` 3 rows all `Exempt` with matching `docs/deferrals.jsonl` rows on disk; the `**Ledger rows:**` line matches the 5 rows actually written for this plan and no runbook task writes or checks a ledger row; no task scopes an edit inside a `bkit:start` / `bkit:end` block (every named doc section sits below `bkit:end`: `docs/observability.md` 25, `docs/testing.md` 445, `docs/architecture.md` 19).

## CRITICAL

**C1 — Three doc tasks and their `[MODIFY]` blocks edit force-overwritten mirrors; the canonical sources are named nowhere and no task regenerates the mirrors.**

The plan targets only the installed copies:

- `docs/plans/202610/logs/699-engine-run-completeness/plan-v1-draft.md:564` — TASK 2 `**UPDATE:** .bkit/workflows.md`: § `status.jsonl` — Row type table gains `engine-call` and `completeness`
- `plan-v1-draft.md:565` — TASK 2 `**UPDATE:** .bkit/jsonl.md`: the `run` row's `scan` block
- `plan-v1-draft.md:586` — TASK 3 `**UPDATE:** .bkit/jsonl.md`: engine writes `friction` as the active workflow, `scope: "bkit-repo"`, the `tool-failure` category
- `plan-v1-draft.md:658` — TASK 7 `**UPDATE:** .bkit/authoring.md`: § Workflows Only conditionality rule
- `plan-v1-draft.md:443`, `:448`, `:453` — the `#### [MODIFY] .bkit/workflows.md`, `#### [MODIFY] .bkit/jsonl.md`, `#### [MODIFY] .bkit/authoring.md` blocks
- `plan-v1-draft.md:512-514` — the same three rows in `Documentation Updates`

`.bkit/{workflows,jsonl,authoring}.md` are **generated mirrors**: `.bkit/core/engine/install/manifest.ts:136-141` calls the consumer copies "force-overwritten mirrors (writeTier1)" of the package-side `.bkit/core/.bkit/*.md` and declares `format: "byte-equal-text"` (`:141`, `:145`, `:155`) — "refreshed every install". Confirmed on disk: `diff .bkit/workflows.md .bkit/core/.bkit/workflows.md` (and the `jsonl` / `authoring` pair) differ only in `{{BKIT_MANAGED_MARKER}}` vs the rendered marker, so the mirror is rendered _from_ the source. Confirmed in history: `462cc14e3`, `9696a839f` and `ca85faeab` change `.bkit/core/.bkit/<doc>.md` and `.bkit/<doc>.md` together with identical line counts. The sibling plan states the convention outright — `docs/plans/202610/650-workflows-prompt-alone-plan-2.md:472` ("Each workflow edit updates its `.bkit/core/.bkit/workflows.md` rows in the same task (repo rule § Workflow edits)"), `:543` (`.bkit/core/.bkit/workflows.md` (→ `.bkit/workflows.md`)) — and `:567` adds a mirror-regeneration task precisely so the run ends with `pnpm bkit check` green.

Two consequences, both blocking: a build following the runbook edits the mirror, and the next `bkit install` / `bkit upgrade` overwrites the edit from a stale source (silent loss); and the drift gate the plan itself requires — `plan-v1-draft.md:831`, "`pnpm bkit check` (drift gate) pass" — reports the mirror as out of sync. No task in the runbook regenerates a mirror (`grep -n "bkit check\|bkit install\|instructions:sync"` over `plan-v1-draft.md` hits only line 831).

Fix for plan-update: add `.bkit/core/.bkit/workflows.md`, `.bkit/core/.bkit/jsonl.md` and `.bkit/core/.bkit/authoring.md` to the `**UPDATE:**` lines and the `[MODIFY]` blocks above as the edit target, have the same task (or TASK 15) regenerate the mirrors with `bkit install` and commit them, and add "`pnpm bkit check` exits 0" to TASK 2 / 3 / 7 / 15 `DONE WHEN`.

## OPTIONAL

**O1 — `Derived Test Matrix` has no row for six behaviours the tasks assert or the Acceptance Scenario requires.** One row per testable behaviour is the matrix's own rule, and a build reads behaviour tests from it; add rows (each mapped to the task that already asserts the behaviour) for:

- a run closed twice carries two `completeness` rows — `Success Criteria` 2, design Key Edge Case 5, and TASK 11 `DONE WHEN` (`plan-v1-draft.md:740`); no matrix row, so `workflows.test.ts` gets the assertion with nothing to trace it to.
- a clean or absent previous run prints nothing, and a checker failure at start prints no warning and no error — TASK 12 `DONE WHEN` (`:753`); TASK 12's single `TEST FIRST` entry covers only the holey case.
- `_Plan-added (error)._` (`:100`): a missing `status.jsonl` / unreadable workflow markdown → check exits 0 with no verdict, close writes no `completeness` row, start prints no warning.
- `BKIT_ENGINE_JOURNAL=off` disables the seam (`journalEnabled`) — the named rollback affordance (`Rollback Strategy` § Code, `:531`) and `Manual Verification` Step 4 (`:852`), the latter unenforced; it is unit-testable in `journal.test.ts` and is not in TASK 3's `TEST FIRST`.
- `_Plan-added (boundary)._` (`:101`, `:102`): no run active in the cwd → nothing journaled / no friction row / no log; friction with an unresolvable `run.parentSha` → row written without the `run` object.

**O2 — the harvest parity assertion is only run manually.** Matrix row 21's target `scripts/harvest/bkit-harvest.test.mjs` is a pure-Node `.mjs` script: `vitest.config.ts` includes `*.test.ts` / `*.integration.test.ts` / `scripts/harvest/**/*.test.ts` only, and `pnpm test` is `vitest run`; `test:harvest` (`package.json:79`) is referenced nowhere in `.github/`, and `Verification Plan` § Automated Tests (`:831-838`) names `pnpm bkit:gate:static-unit-integration` and `pnpm bkit check` only. TASK 1's `DONE WHEN` does name the case, so nothing is lost — but name `pnpm test:harvest` in the gate suite (or the `DONE WHEN`) so the assertion is actually executed.

**O3 — the supersession removal is not a task field.** The `Supersession Inventory` decision is `DELETE`, and TASK 6 performs it, but inside an `**UPDATE:**` bullet (`:638`, `**[DELETE]** deriveExpectedStepSetFromSource and checkSourceCanonicalDrift`). The runbook field set has a `**DELETE:**` field; split it out so the removal is machine-visible to `bkit tests plan-check` and the Gate 2 "every `[NEW]` traces to a `Reuse Inventory` `NEW` row" sweep.

**O4 — `Related Issues` is inaccurate.** `Context & Goals` (`:34`) states "No open related issue: `related-issues.md` = `None.`", and `Suggested Scope Expansion` (`:235`) repeats it — but the supplied `related-issues.md` holds ten issues, four of them open: `#701` (engine work in build verify and ship), `#556`, `#100`, `#101`. `#701` is the overlapping one: its Success Criteria make `bkit tests plan-check` refuse a `Derived Test Matrix` row mapped to no task and a `DELETE` with no `Supersession Inventory` row, which is this plan's own matrix / supersession surface, and it also moves `commands/conventions.test.ts` (this plan's matrix row 25). List the four, and add a `keep deferred` / `needs design decision` row for `#701`.

**O5 — TASK 15's scope does not name the `dist/` rebuild.** `Reuse Inventory` ("Generated + committed artifacts", `:307`) and the "Rebuilt payload" note (`:492`) say `pnpm build` runs in the same change, and `DONE WHEN` (`:801`) checks `pnpm bkit:check:dist`, but the task's fields only `UPDATE docs/capabilities.md` and `READ package.json` — so the task that its own `DONE WHEN` requires (`dist/` rebuilt and committed) is out of its scope. Add `**UPDATE:** dist/`: rebuilt with `pnpm build` and committed.

**O6 — TASK 13's new CI logic is unspecified and untested.** The step keeps `pnpm bkit:audit:status || true` yet must fail the lane when the sweep printed no summary line (`:768-772`), with `TEST FIRST: n/a — CI configuration only`. Name the mechanism (republished output captured and grepped, or a `bkit ci <verb>` — the repo's existing `bkit ci prose` precedent / `lint:prose`), and if it is inline shell, cover it in the `tests/*.bats` tier the repo already uses for shell logic.

**O7 — the `Reuse Inventory` row for the seam does not record the kill-switch search.** The row's capability lists `journalEnabled`, but its `Search performed` covers only `ledgers/telemetry.ts`, `ledgers/status.ts`, `commands/workflow/ledgers.ts` and `commands/lib.ts` — no search for an existing env-gate idiom, though the engine has one (`process.env.BKIT_DEBUG` in `checks/after/ci-yml.ts:291`) and a set of `BKIT_*` variables. Record the search and the decision for that piece.

**O8 — TASK 14's `DEPENDS ON: 6, 9, 4, 10` (`:783`) omits TASK 3 and TASK 11**, whose emitted lines it documents (the seam's `[bkit-telemetry] {kind} row not written: {reason}` swallow line and the `BKIT_ENGINE_JOURNAL` kill switch from TASK 3; the `journalSuspect` heartbeat line set by the close path in TASK 11). Group order makes it harmless today; the field should still name them.

## OUT OF SCOPE

Not applied to this plan; each is a separate proposal.

- Fold `telemetry validate`'s ts-mint / append-once invariants (failure key `telemetry-validate-does-not-enforce-ts-mint-or-duplicate-line-invariants`) into this change because the seam composes rows through `validate` — widening a validation contract inside a change that already touches the CLI hot path. Propose separately.
- Give `status.jsonl` a per-workflow run boundary (deferral `58-status-jsonl-run-boundary-keys-on-last-run-overall`) so the start warning's "the run immediately preceding" referent is defined by the state substrate rather than by fold order. Needs the `#209` decision first.
- A per-workflow rollback path for a shipped-but-wrong bkit workflow change (deferral `per-workflow-rollback-path-for-shipped-bkit-workflow-changes`) — the plan's rollback is `git revert` plus `BKIT_ENGINE_JOURNAL=off`, a per-run escape, not a revert; its own affordance design.
