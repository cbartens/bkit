Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 25
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 11

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- TASK 25 satisfied: `pnpm/action-setup` and `actions/setup-node` in the context job carry `continue-on-error: true` in `.bkit/templates/.github/workflows/bkit-cloud.yml:197-206` and the adopted `.github/workflows/bkit-cloud.yml`. `Install bkit` already has `continue-on-error: true`, so a failed tooling step leaves `node_modules/.bin/bkit` absent and `bkit_gate` reports `bkit-unavailable` (group 10 TASK 22), matching `docs/observability.md:190`. The adopted copy differs from the template only in `runs-on` and `node-version-file`, as before.
- TASK 26 follows owner decision `build-decision-4-2.md` Q1 option (a). `Select agent job` reads `bkit.cloud.agent` from the root (`dev`) `package.json` and accepts only `claude|opencode|codex|cursor|none`. `Resolve phase + brief context` overlays `dev`'s `bkit.cloud` / `bkit.tracker` onto `pr-head/package.json`, so `bkit_gate` (`:437`) and bkit run under `cd pr-head` read `dev`'s copy. A jq check of the overlay filter confirmed three cases: `dev` values replace the head's; the head's are dropped when `dev` has none; and they are added when the head has none. The code and its test are done. It stays off `Tasks` because `docs/security.md:180` and the checkout comment in the router still describe the old head-read (see the gap).
- Test-first audit `build-tests-green-11-1.md`: `Enforced: true`, 0 gaps, 0 unproven, no updated or already-landed tests.
- Local run: `pnpm vitest run` on `workflow-templates.integration.test.ts`, `cloud-ctx-step.integration.test.ts` and `dogfood-templates.test.ts` passed all 3 files (168 tests), including both TEST FIRST tests.

## Identified Gaps Log

1 gap.

- TASK 26: routing config now comes from `dev` (owner decision `build-decision-4-2.md` Q1 option (a)), but two descriptions in the same change still say it comes from the feat/** head: `docs/security.md:180` (§ Same-repo PR steering its own routing: "a same-repo PR's head `package.json` (`bkit.cloud.agent`, `bkit.tracker.default`) ... are DATA the routing run reads from a `pr-head` checkout") and the checkout comment in `.bkit/templates/.github/workflows/bkit-cloud.yml:165-167` plus its adopted copy `.github/workflows/bkit-cloud.yml` ("its `package.json` config, `status.jsonl` and `.bkit/issues.jsonl` feature rows are what the router reads"). Both should say only the marker, branch name, `status.jsonl` and `.bkit/issues.jsonl` are read from `pr-head/`, and `bkit.cloud` / `bkit.tracker` come from the `dev` checkout. — Fixable: true
