Verdict: PASS
Failures: 0
Fixable: false
Tasks: 15
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 5

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- TASK 15 is satisfied. `classifyShell` in `.bkit/core/hooks/guardrails-tiers.js:289-300` now denies under the Codex hook whenever `TESTS_JUMP_RE` matches the command text, whatever `askRule` returned first. The three rendered copies (`.codex/hooks/bkit-guardrails.cjs`, `.cursor/hooks/bkit-guardrails.cjs`, `.agents/plugins/bkit/hooks/bkit-guardrails.cjs`) carry the same change, the `.bkit/version` hashes for the Codex and Cursor copies match the files on disk, and `bkit check` exits 0 with no drift.
- Reproduced through `node .codex/hooks/bkit-guardrails.cjs`: `gh pr close 999999; bkit tests jump build-1`, `sudo -n true; bkit tests jump build-1`, `git checkout -- .; bkit tests jump build-1` and `git stash drop; bkit tests jump build-1` all return `permissionDecision: "deny"` naming `bkit tests jump`. A plain `gh pr close 1` still gets the advisory, and `git push --force ...; bkit tests jump ...` still hits the earlier force-push deny. Cursor still answers `permission: "ask"` for the compound command.
- `.bkit/core/engine/install/modules/index.integration.test.ts` `the codex hook denies bkit tests jump chained after another ask-tier command` passes, and the whole `permissions-parity` block passes (133 passed). The test-first audit (`build-tests-green-5-1.md`) is `Enforced: true`, `Gaps: 0`, `Unproven: 0`, with the test recorded red before the fix.
- The supplied decision records (`build-decision-1-1.md`, `build-decision-1-2.md`) cover group 4 and do not apply to this group.
- The `docs/deferrals.jsonl` rows added in this diff are LOW challenge findings recorded by the challenge step, not TASK 15 work; they neither satisfy nor block it.
- Out of scope, proposed separately: in `guardrails-tiers.js:168-170` the new `TESTS_JUMP_RE` sits between the `/** Ask tier, non-git — destructive or privileged shell. */` comment and `ASK_PATTERNS`, so that comment now sits above the regex it does not describe. Cosmetic only, no behaviour change.

## Identified Gaps Log

None
