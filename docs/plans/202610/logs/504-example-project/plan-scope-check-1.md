Verdict: PASS
Failures: 0

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit.

## CRITICAL

None. Every `Agent Execution Runbook` task (1–9) carries an explicit scope, a codebase-verifiable `**Done when:**`, and a verification step; every scope item in `Architecture & Component Changes` has a build task; every `Derived Test Matrix` row is realised by a runbook task; `Supersession Inventory` ("None") and `Reuse Inventory` (21 rows, non-empty `Search performed`) are present; every `Out of Scope` row is a genuine `Exempt` (no `Success Criteria` / matrix / design requirement parked there).

Verified against source, not memory:

- Template conformance: all mandated `docs/templates/bkit-plan.md` sections present and populated (Context, Acceptance Scenario + sub-sections, Breaking Changes, Open Questions, Alternative Approaches, Out of Scope, Suggested Scope Expansion, Security & Privacy, Pre-Flight/Gate 1, Data Schema Integration, Reuse Inventory, Architecture & Component Changes + Migrations + Cron, Supersession, Documentation Updates, Rollback, Runbook/Gates 2–3, Verification Plan/Automated/Gate 4/Manual).
- Task 1 → `examples/bkit-explainer/{index.html,data.js,FEATURE-REQUEST.md}`; scope + Done when (files exist, `node --check`, single-sourced sentinel, slop-safe).
- Task 2 → `harness/{package.json,pnpm-lock.yaml,README.md,gitignore}`; scope + Done when (parse, `scripts.test` exact string, `bkit` block, gitignore).
- Task 3 → `harness/bkit-ci.yml`; scope + Done when (`actionlint` clean on the file, PR-only gating `if`, no `contents: write`, no `[skip ci]`, cross-file no-drift guard on capstone/ci names).
- Task 4 → bootstrap + rulesets; scope + Done when; boundary assertion mapped to Manual Step 2.
- Task 5 → per-run path; scope + Done when (reset commit message, no delete outside `example/`, failure names left-behind state).
- Task 6 → `tests/fixtures/gh/bin/gh` (extend) + `tests/example-run.bats`; scope + Done when binds all matrix rows; explicit non-scope (no `gh repo create`/`view`, no `bkit runs gate --repo`).
- Task 7 → `examples/analysis-prompt.md`; scope + Done when (report/screenshot paths, prompt revision, fetch mechanism, non-gating).
- Task 8 → `slop-scan.config.json` + `package.json`/`bkit-ci.yml` actionlint + `lint:prose`; scope + Done when incl. prove-it-can-fail pair and `.prettierignore` conditionality.
- Task 9 → `examples/README.md` + `.agents/docs.md` registration + doc/ADR sync; scope + Done when; explicit "below `bkit:end`, never inside the managed block".
- Derived Test Matrix (5 rows) ↔ Runbook: all five rows target Task 6 (and the stub, Task 6); Task 6's `Done when` carries every row's test; no row without a target file; no verification task without a row.
- Scope items → tasks: fixture (T1–3), runner (T4–5), stub+suite (T6), analysis prompt (T7), gates registration (T8), README+docs (T9); T8 depends on T3/T4–5; docs/decisions/deferrals ledgers exist; `package.json` `files` excludes `examples/` (assumption verified).
- `Reuse Inventory`: every `[new]`/`EXTEND` architecture item traces to a row; `Search performed` non-empty; `NEW` rows carry reason (a)/(b).
- No task edits inside a `bkit:start`/`bkit:end` managed block (`package.json`, `slop-scan.config.json`, `.prettierignore` carry no such block; `.agents/docs.md` edit is scoped below `bkit:end`).

## OPTIONAL

- **Matrix ↔ Runbook cardinality:** all 5 matrix rows collapse to the single verification task (Task 6). Bidirectional coverage holds (no orphan row, no orphan verification task), but the mapping is 5:1 rather than 1:1. Acceptable given one bats suite owns all runner assertions; consider splitting Task 6's `Done when` into per-row bullets so each row's assertion is individually tickable.
- **Bootstrap has advisory-only verification:** Task 4 (create/verify-repair idempotence, ruleset payload) has no automated gate — its only check is Manual Step 2 (advisory, blocks nothing). Documented and justified (the `gh` stub exits 1 on non-`api` argv by design). If bootstrap regressions matter, add a stub shape for `gh repo create`/`gh repo view` so idempotence becomes bats-testable.
- **`NEW` reason (b) traceability:** two rows use reason (b) ("Satisfying ship's merge gate" — the ~1065-line template; "Enforcing never-prune + merge-gate invariants natively" — `bkit setup protect-main`). Reason (b) asks for both broken contract and callers to be named; the justifications lean toward (a) no-candidate. Tighten the wording or reclassify to (a).
- **Harness root traceability:** the `[new]` `examples/bkit-explainer/harness/` block cites "reason (a)" but does not name the owning `Reuse Inventory` row (row 1, "Versioned example fixture"). Add the explicit row reference for tighter traceability.
- **Task 8 `prove-it-can-fail` method:** the Done when temporarily breaks `.github/workflows/*` and the fixture workflow to observe red. State that the break is reverted within the task so the transient edit cannot weaken CI.
- **Fixture verification depth:** `index.html`/`data.js`/`FEATURE-REQUEST.md` are verified only by Task 1's `Done when` (`node --check` + sentinel count) plus Task 8's lint/format; no dedicated verification task. Appropriate for static/data fixture files (the app itself is exercised only during a run), but note it explicitly so it is not read as an omission.

## OUT OF SCOPE

- Adding a bkit CI smoke job for the example — already declined (design WS-6 dropped) and parked; do not fold.
- Building/road-testing an aggregate results store, `benchmark.mjs`, or run-replay viewer — the cycle deliberately reads `.bkit/stats.jsonl` raw; the later ideas live in `docs/deferrals.jsonl`.
- Adding a Linear/tracker-none advisory or second example app — tracked deferrals, not this cycle.
- Test-runner tier reassessment (e.g. promoting bats rows to `E2E`/`@live`) — the `Integration` tier over a real temp git repo is the correct lowest tier; no change proposed.
