Verdict: PASS

<!-- verdict:end -->

# Ship — Update Docs (bar-130-ci-lint-scaffolding) — Second Ship Cycle

**FID:** bar-130-ci-lint-scaffolding
**Phase:** Ship (second cycle, parallel with `@bkit-ship-summary`)
**Working tree:** `/Users/christian/Documents/GitHub/bkit` on branch `dev` (post-squash-merge of hotfix PR #2)
**Date:** 2026-05-05

## Context

Second ship cycle for BAR-130. PR #1 (main feature, v0.1.2 — three sub-plans A/B/C) merged at commit `8646711`. Post-merge dev CI run [25354307730](https://github.com/cbartens/bkit/actions/runs/25354307730) failed deterministically at `Setup pnpm` (`pnpm/action-setup@v4` aborted on dual-SoT — `with: version: 10` + `package.json#packageManager: pnpm@10.33.0`). Debug cycle (diagnose + remediate) produced KN-3 + 2 regression guards + retire-token pending entry; PR #2 (hotfix on `fix/bar-130-ci-pnpm`) merged. No version bump (still v0.1.2). This artifact records the docs surfacing for the second ship.

## Files updated

- [x] `docs/completed.md` — Appended new entry "bkit CI hotfix — drop dual pnpm SoT (KN-3) — BAR-130 (2026-05-05)". Records the second ship cycle (hotfix scope) per append-only ledger policy. Cross-references debug logs (`debug-summary.md`, `debug-failure-{diagnose,remediate}-1.md`), KN-3, the two regression guards in `bkit-modules.integration.test.ts` lines 534–557, and the v0.2 retire pending entry. Notes both ci.yml files (bkit-self + consumer template) fixed in single hotfix to prevent template-parity drift to consumers.

## Files reviewed but NOT touched

- [x] `docs/knowledge.md` — KN-3 (pnpm/action-setup@v4 single-SoT rule) verified present at lines 49–59. Symptom + root cause + fix rule + Severity:critical + Related links to both ci.yml files + run 25354307730. Already correctly added during debug-remediate cycle. Sole-writer policy: docs subagent does NOT re-write existing entries.
- [x] `docs/pending.md` — `v0.2: Retire {{PNPM_VERSION}} token` entry verified present at lines 53–61. Type:issue, Severity:low, Status:open. Cross-references KN-3, BAR-200 v0.2 sweep, `bkit-tokens.ts` + `bkit-tokens.test.ts`. Already correctly added during debug-remediate cycle. Sole-writer policy: docs subagent cannot write `pending.md`.
- [x] `docs/decisions.md` — DE-1 (3-tier ownership) and DE-2 (module-flag CLI) verified present at lines 32–50 from first ship. Hotfix did not introduce new ADRs — no second-ship updates required.
- [x] `docs/architecture.md` / `docs/technology.md` / `docs/deployments.md` / `docs/observability.md` / `docs/security.md` — Reviewed; no stale references to hotfix-changed files (`.github/workflows/ci.yml`, `.agents/templates/.github/workflows/ci.yml`, `.agents/scripts/bkit-tokens.ts`). bkit is a CLI tool repo; consumer-facing docs unchanged. No updates required.
- [x] `docs/testing.md` — Empty stub. Hotfix did not introduce new testing patterns; regression-guard regex pattern in `bkit-modules.integration.test.ts` is co-located with the test it defends, not a doc concern.
- [x] `docs/data-schema.md` / `docs/data-pipeline.md` / `docs/data-cron-jobs.md` / `docs/webhooks.md` / `docs/notifications.md` / `docs/styles.md` — N/A (bkit is a CLI tool, no DB / webhooks / UI).
- [x] `.agents/docs.md` — No new docs introduced; Workflow Matrix + Full Catalog unchanged.
- [x] `README.md` / `.agents/README.md` — Already rewritten in build phase (Tasks 8.1, 8.2). Hotfix touched workflow YAML only; no doc-prose changes warranted.

## Pending Items Surfaced (FID=bar-130-ci-lint-scaffolding)

Per sole-writer policy, `pending.md` is owned by remediator/synthesizer agents. `bkit-ship-update-docs` only surfaces existing entries here for human review:

1. **`bkit-ship: auto-derive git tag from package.json version` (2026-05-04)** — open. `bkit-ship.md` does not auto-derive `v${VERSION}` tag from `jq -r .version package.json`. Workaround: human runs `git tag v0.1.2 && git push origin v0.1.2` manually after ship merge. Path: `.agents/workflows/bkit-ship.md`.
2. **`MED-8: runPayload WriteSet threading` (2026-05-05)** — deferred. Architectural fix (merge `copyAdditive` + `runPayload` into one idempotent pass) tracked for v0.2. Cross-references KN-1.
3. **`v0.2: Retire {{PNPM_VERSION}} token` (2026-05-05)** — open. Dead-code retirement after KN-3 hotfix removed token's only substitution site. Bundle with `init` / `--host=` deprecation removal sweep at v0.2 (BAR-200).

No new pending items surfaced by the hotfix that aren't already tracked. The diagnose log § "Out of scope" item 1 (audit how PR #1 passed CI despite the defect) remains open as observation but is not a tracked pending entry — recommend the synthesizer/orchestrator decides whether to file a Linear ticket.

## Stale Doc Check

Searched `docs/**` and `.agents/**` for references to hotfix-changed files:

- `.github/workflows/ci.yml` — referenced only in plan archives (immutable) + KN-3 entry (current).
- `.agents/templates/.github/workflows/ci.yml` — referenced only in plan archives + KN-3 entry + `.agents/README.md` template-paths table (still accurate — file still exists, just with `with.version:` removed).
- `.agents/scripts/bkit-tokens.ts` — referenced in plan archives + KN-3-adjacent pending entry. NOTE comment added inside the file is self-documenting; no external doc reference is stale.
- `.agents/scripts/bkit-modules.integration.test.ts` — referenced in plan archives + new KN-3 entry. No external doc reference is stale.

`.agents/IDEs.md` is modified in working tree (uncommitted). Diff inspected — no content references hotfix-touched files; modification appears unrelated to BAR-130.

No stale docs found.

## Learnings extracted (verification)

<!-- prettier-ignore -->
| Learning | Persistence path | Verified status |
| --- | --- | --- |
| KN-3: pnpm/action-setup@v4 dual-SoT abort + fix rule (drop `with.version:`, let `packageManager` be SoT) | `docs/knowledge.md` lines 49–59 | Present and correct |
| `{{PNPM_VERSION}}` is dead code post-hotfix; retire in v0.2 | `docs/pending.md` lines 53–61 | Present and correct |
| Hotfix scope record (second ship cycle, no version bump) | `docs/completed.md` (appended this run) | Added |
| Squash-merge rebase friction for hotfix branches | `.agents/friction.md` (debug log noted RECOVERED) | Out of docs subagent scope |

## Verification

- [x] `docs/completed.md` hotfix entry references debug log paths and KN-3.
- [x] No commits made by this agent (orchestrator handles git).
- [x] No edits outside `docs/completed.md` + this log file.
- [x] No edits to `status.json`.
- [x] Sole-writer policy honored: knowledge.md / pending.md not modified by this agent.

## Blockers

None.
