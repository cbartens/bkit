# Debug Abort Handover

## The Short Version

The feature (#719, letting the cloud runner work with any agent and any issue tracker) is built and every planned item is delivered. Shipping stopped because two behaviours of the "Select agent job" step lost their test coverage when the tests were rewritten, so a future change could break them without any test failing. The fix is two small test additions, which this run is not allowed to write.

## What's Actually Happening

- **Symptom:** Ship Step 5 (Deferred Sweep) returned FAIL with 2 failures, 0 lazy deferrals.
- **Trigger:** TASK 7 moved choosing which agent job runs (claude / opencode / codex) into the `Select agent job` step of `.bkit/templates/.github/workflows/bkit-cloud.yml`.
- **Proximate cause:** The old tests asserted `claude: "true"` (federation variables only, `cloud-ctx-step.integration.test.ts:1433`) and `opencode: "true"` (`:1446`). The rewritten tests assert only `enabled: "true"` on the credential gate. No test runs the select step with only the two federation variables, or with `bkit.cloud.agent` = `opencode`. Lines `bkit-cloud.yml:242` (`have_claude`), `:244` and `:253` (opencode) are untested.
- **Root cause:** The rewrite followed the code move for the gate step but did not re-home the selection assertions to the new step.
- **Contributing factors:** The adopted copy `.github/workflows/bkit-cloud.yml` has identical lines. Both requirements are current (TASK 7), not retired.

## Rot Signals

None

## Out-of-Scope Recommendations

None. (Post-merge housekeeping from the sweep: close deferral `397-dual-agent-same-run-double-ship-when-both-secrets-set` once the branch is merged, as the plan's Documentation Updates row asks.)

## Attempt History

<!-- prettier-ignore -->
| Strategy | What was tried | Why it failed |
| --- | --- | --- |
| STANDARD | Ship Step 5 Deferred Sweep (read-only audit) | FAIL: 2 blocking deferrals (lost assertions). No ship-failure-diagnose or remediate attempts exist. |

## Verified Resolutions (do not roll back)

- All 5 success criteria and all 26 runbook tasks marked Delivered by the sweep.
- Sweep run this session: 861 unit tests and 197 integration tests passed, no skips. `node dist/cli.js check` exit 0, 0 blockers. Full gate `pnpm bkit:gate:static-unit-integration` passed in `run-tests-2.md`.
- Template and adopted workflow copy are unchanged by the needed fix. Do not revert the `BKIT_` secret renames, the `bkit_gate` kill switch, or the codex job.

## Persistent Errors

- Failed requirement: Blocking Deferral 1 and 2 in `ship-deferred-sweep.md`.
- File: `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` (describe `bkit-cloud.yml gate step — per-job credential detection`, `:1359`).
- No runtime error message. Both are silent coverage gaps: a change dropping the federation clause from `have_claude` (`bkit-cloud.yml:242`), or a provider key from `have_opencode` (`:244`), would pass the whole suite.
- Sequence: sweep wrote verdict FAIL (12:20:31Z), the ship workflow was marked failed (12:20:36Z), a failure comment was posted on issue #719.

## Recommended Next Steps

1. **Add the two tests, rerun `/bkit-ship #719`.** ✅ FIXES both gaps. ❌ Does not change the template. ⚠️ COST: small, test-only, one file.
   - Federation: `runSelect("claude", { ANTHROPIC_FEDERATION_RULE_ID: "fdrl_x", ANTHROPIC_ORGANIZATION_ID: "<uuid>" })` with no `BKIT_ANTHROPIC_API_KEY`; expect `selectedJobs(outputs)` equal `["claude"]` and `outputs.dispatched` `claude`.
   - Opencode: `it.each` over `BKIT_OPENCODE_API_KEY`, `BKIT_OPENROUTER_API_KEY`, `BKIT_OLLAMA_API_KEY`; `runSelect("opencode", { [key]: "k", BKIT_ANTHROPIC_API_KEY: "k" })`; expect `["opencode"]` and `outputs.ignored` containing `claude`.
2. **Ship without the tests, accepting the gap.** ✅ Fastest. ❌ Leaves two silent regressions possible. ⚠️ COST: needs an owner waiver; the sweep rule treats this as blocking.
3. **Revert the select-step move.** ✅ Removes the gap. ❌ Undoes TASK 7. ⚠️ COST: large, cascades through the plan.

## Recommended Path

Option 1. It is the exact fix the sweep specified, touches one test file, and needs no template change. Mutation-check each new test (remove the clause, confirm it fails) before rerunning ship.

## Reference Docs

- `docs/plans/202610/logs/719-cloud-variants-add/ship-deferred-sweep.md` (full sweep, Handover Notes)
- `docs/plans/202610/logs/719-cloud-variants-add/ship-input-1.md`, `run-tests-2.md`, `build-plan-verify-9-2.md`
- Plan: `docs/plans/202610/719-cloud-variants-add-plan.md` (TASK 7)
- Ledger rows appended to `docs/failures.jsonl`: `719-select-agent-federation-only-untested`, `719-select-agent-opencode-branch-untested`. No deferral rows written: neither gap fits a deferral reason, so it is unfinished work.
- Failure comment: https://github.com/cbartens/bkit/issues/719#issuecomment-6721412857
