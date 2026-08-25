# Ship Deferred Sweep — #363

> **Reconstruction note:** the original artifact created by this step was written inside `.worktrees/363-widen-bkit-cloud-trigger` and was destroyed when the worktree was force-removed in Step 12, before any commit captured it (see `docs/failures.jsonl` key `363-ship-worktree-artifact-lost-before-any-commit-captures-it`). This file reconstructs the subagent's full chat-return report verbatim from the orchestrator's transcript; it is not a re-run of the sweep.

## Verdict: PASS — 0 blocking deferrals

### What was verified independently (not taken on trust)

All 5 acceptance criteria and all 14 plan tasks are satisfied in the current tree. All 11 reconciled challenge findings were re-checked against the actual files rather than trusting the closure report — F1 through F11 are genuinely fixed, including the two that the abort handover called persistent:

- **F1** (the load-bearing one): the cross-tool-call `mktemp` + `$GITHUB_ENV` handoff is gone from all 5 sites; each fence now re-derives with `gh issue view {ISSUE_ID} --json labels --jq '.labels[].name' 2>/dev/null | grep -qxF 'bkit:auto'`. `BKIT_AUTO_ROUTE_FILE` survives only inside two _negative_ assertions. Verified in `.bkit/workflows/bkit-{ship,build,debug}.md` **and** all three host mirrors (the mirror staleness that produced F2 is closed — grepped each of the 12 mirror files).
- **F3/F4/F6/F7/F8/F9/F10** all confirmed in `bkit-cloud.yml` at both jobs, and template vs `.github/` copy differ only by the `{{CLOUD_RUNNER}}` substitution.
- The new `bkit-auto-route-marker.integration.test.ts` actually executes the sliced fences against a stubbed `gh` and asserts the rendered `--subject` — it is not the shape-only test that previously passed on an inert mechanism.

No `TODO`/`FIXME`/`HACK`/`XXX` in the diff, no `.skip`/`.todo`/`xfail`. The two `describe.skipIf(!hasTools)` guards need only bash/grep/git/jq/GNU sed, all present on `ubuntu-latest`.

### The three unmet `Done when` lines are all declared, so none blocks

1. Version bump to 4.11.0 (Task 8 / T12) — withdrawn; `decisions.jsonl` key `version-bump-belongs-to-the-release-commit` + deferral `363-plan-t12-still-instructs-the-version-bump`.
2. `bkit-debug.md` zero-diff (Tasks 3 + 9 / T8) — deliberately superseded by maintainer decision on #363 (2026-07-30T02:57:20Z): the dead `${LABELS:-}` idiom was pre-existing on `dev`, so `bkit [auto route]` had never been emitted by any workflow, and all three were fixed rather than shipping a half-repaired mechanism. More was delivered, nothing deferred.
3. Task 11 / T13's literal `FID=363` — corrected to the full slug by declared finding H1 (`build-challenge-remediate-log.md:9`); truncation would have broken the dev/fix shared-budget invariant.

### The thing the ship summary most needs to resurface

The build workflow's terminal ledger state is `build-challenge-reconcile` **FAIL** + `workflow-failed` (`status.jsonl:33-34`) — the corrected code was never re-challenged. This is **not** a hidden gap: `ship-input.md:792` declares it verbatim as an accepted trade-off — _"skipping the build re-run forgoes a fresh adversarial `build-challenge` pass over these fixes... CI and the deferred sweep are a different, weaker net."_ Exempt, but it is the highest-value item in the exempt list and belongs in front of the human.

### Two informational items worth a glance (neither is a deferral, neither gates)

- `.bkit/workflows.md:1019` — a row added by the F1 fix commit `95db55ce` describes the squash-subject marker as "`bkit:auto` re-read from `{LABELS}` immediately before merge", i.e. the exact dead mechanism that commit removed, contradicting the corrected `:620` in the same consumer-shipped file. One stale parenthetical, no functional effect. This is the kind of thing the forgone challenge pass would have caught.
- `bkit-cloud.yml` keeps internal finding labels in comments (`#363 F7`, `#363 F8`, `#363 L4`, `#363 C1`, `#363 M6`) and `bkit-counter-bus-config.sh:25` carries `# #363`, while the same branch establishes `shipped-docs-no-internal-identifiers`. Those files were outside that sweep's declared scope (10 docs + four `bkit-*.md` workflows), so it is a consistency observation, not a gap.

Also confirmed: Task 14's tracker comment exists on #363, ship rows are being written to the main clone's `status.jsonl` via `BOOK_ROOT` (the worktree copy having no ship rows is correct, not a telemetry hole), and `ship-conflict-resolve.md` records a clean rebase with the full suite green (2797 passed / 2 skipped / 1 todo).

None.

<!-- verdict:start -->

Verdict: PASS
<!-- verdict:end -->
