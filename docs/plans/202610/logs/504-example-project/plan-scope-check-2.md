Verdict: CONCERNS
Failures: 1

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit.

## CRITICAL

- **Missing verification for the runner's `issueTracker != github` stop — the design's highest-ranked silent failure.** `Architecture & Component Changes` (runner install + read-backs) and `Edge Cases` both specify: _"bkit install recorded `issueTracker: none` → Runner reads `bkit.issueTracker` back after install and stops unless `github`"_. Nothing verifies it. `Derived Test Matrix` has no row for it; Task 6's stated scope is `preflight / reset-scope / gate-chain` only; Task 5's `Done when` omits the read-back stop; `Verification Plan → Bats` enumerates only reset-scope, preflight, run-in-flight guard, gate-chain, stub `auth`. Add a `Derived Test Matrix` row (`Integration` → `tests/example-run.bats`), extend Task 6's scope + `Done when` to assert the runner aborts when the read-back yields non-`github`, and add the assertion to Task 5's `Done when`. Design rationale makes this load-bearing: the runner read-back is the sole mitigation for the tracker-`none` failure the design ranked highest (Approach "Human as the assertion engine" rejected for re-opening it).

## OPTIONAL

- **Version read-back (`pinnedVersion`) is unverified.** Architecture requires reading the installed version via the `.bkit-version` JSON schema; no matrix row, task assertion, or bats case covers it. Fold into the same Task 6 assertion battery as the tracker read-back.
- **`Derived Test Matrix` (5 rows) ↔ a single verification task (Task 6).** Each row maps to exactly one task (template-conformant), but the many-to-one shape means row 3 (`run-in-flight guard` / `--force-run`) and row 5 (stub `auth status` / non-`api` exit 1) are only implicitly named by Task 6's "preflight" wording. Consider enumerating each row id in Task 6's `Done when` so a dropped case is visible.
- **`tests/example-run.bats` and `examples/README.md` are `[new]` but their `Reuse Inventory` capability rows are decided `EXTEND-EXISTING`** ("Runner verification over a `gh` stub"; "Contract documentation"). The Architecture `Reuse Check` gives each `[new]` its own reason inline (b)/(a), so the label mismatch is cosmetic — but align the row decision or split the capability so the `[NEW]` traces cleanly.
- **"AI run-analysis prompt" `NEW` reason reads as (b), not (a).** The Justification labels `(a)` yet names an existing candidate (`docs/templates/bkit-audit-*.md` + `@bkit-audit-generate`) and argues the extension breaks its destination contract (writes into bkit's repo vs the run repo) — reason (b). Substance is fine; correct the letter.
- **Fixture `FEATURE-REQUEST.md` verification is existence-only.** Task 1 `Done when` asserts "all three files exist" for it but not that the content carries the four traps as plain requirements, the plain-`<script src>` / one-pure-function rules, and the sentinel-quoting prohibition — the properties Tasks 3/6 depend on. Add a content assertion.
- **`harness/README.md` content unverified.** Task 2 `Done when` checks `package.json`/`gitignore` fields but not the README's stated contract (main=fixture, dev=integration, reset, stats read path, never-prune).
- **Bootstrap create / verify-and-repair has no automated coverage.** Documented and design-blessed (the `gh` stub exits 1 on non-`api` argv; C10 de-risking is the live canary, Manual Verification Steps 2–3). Noted for the record: Manual Verification is advisory-only, so Success Criteria 1's create/repair path rests entirely on a non-gating human canary.

## OUT OF SCOPE

- Add a `--runs N` / median-fold harness or `benchmark.mjs` (design "Does the benchmark ship any tooling?" → A: none; deferral `504-*`). Not applied.
- Add a bkit CI smoke job for the example (design WS-6 dropped; binding "ad hoc runs only"). Not applied.
- Add a second fixture / example app (`504-second-example-extending-existing-code`, `504-additional-example-apps`). Deferred; not applied.
- Fold in the `bkit runs gate --repo … --pr …` `HIGH` failure (`runs-gate-repo-flag-ignored-pr-resolved-from-checkout`). Plan already encodes the non-use constraint; the fix stays its own cycle.
- Fold in `github-mcp-search-issues-silently-returns-zero-private-repo`. Outside this plan's surfaces.
