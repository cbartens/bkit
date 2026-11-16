Enforced: true
Verdict: CONCERNS
Gaps: 1
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/803-close-codex-opencode-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 7 | `.bkit/core/engine/install/network-allowlist.test.ts` "records the fingerprint of its own domains list" | red | passed |
| 7 | `.bkit/core/engine/install/network-allowlist.test.ts` "moves the fingerprint when allowed-domains changes" | red | passed |
| 7 | `.bkit/core/engine/install/cloud-env.test.ts` "renderCloudNetworkAllowlist names the .bkit/allowlist.json fingerprint and the BKIT_CLOUD_ALLOWLIST_FINGERPRINT step" | red | passed |
| 8 | `tests/shell/bkit-cloud-bootstrap-preflight.bats` "fingerprint: warns with the refresh steps and exits 0 when BKIT_CLOUD_ALLOWLIST_FINGERPRINT is unset" | red | passed |
| 8 | `tests/shell/bkit-cloud-bootstrap-preflight.bats` "fingerprint: warns naming both fingerprints when they differ, and continues" | red | passed |
| 8 | `tests/shell/bkit-cloud-bootstrap-preflight.bats` "fingerprint: reports a match as operator-asserted with the deployed allowlist unverified" | red | passed |
| 8 | `tests/shell/bkit-cloud-bootstrap-preflight.bats` "fingerprint: warns and continues when .bkit/allowlist.json has no fingerprint or jq is absent" | red | not passed |
| 8 | `tests/shell/bkit-cloud-bootstrap-preflight.bats` "fingerprint: rejects a value that is not 8 hex characters without echoing it" | red | passed |
| 8 | `tests/shell/bkit-cloud-bootstrap-preflight.bats` "fingerprint: warns and continues when .bkit/allowlist.json is not valid JSON" | red | passed |
| 9 | `.bkit/core/engine/checks/before/files.test.ts` "reports an adopted bootstrap that never reads BKIT_CLOUD_ALLOWLIST_FINGERPRINT" | red | passed |
| 9 | `.bkit/core/engine/checks/before/files.test.ts` "accepts a customised bootstrap that reads the variable" | red | passed |
| 9 | `.bkit/core/engine/checks/before/files.test.ts` "stays silent when no bootstrap is adopted" | red | passed |
| 9 | `.bkit/core/engine/commands/install/check.integration.test.ts` "bkit check reports a stale adopted cloud bootstrap with the template block to copy" | red | passed |
| 9 | `.bkit/core/engine/commands/install/doctor.integration.test.ts` "bkit doctor lists a stale adopted cloud bootstrap" | red | passed |

## Gaps

- Task 8 `not-green` — "fingerprint: warns and continues when .bkit/allowlist.json has no fingerprint or jq is absent" failure — Fixable: true — log: TASK 8: `tests/shell/bkit-cloud-bootstrap-preflight.bats` `fingerprint: warns and continues when .bkit/allowlist.json has no fingerprint or jq is absent` — not-green — Fixable: true

## Runner output — `tests/shell/bkit-cloud-bootstrap-preflight.bats`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs tests/shell/bkit-cloud-bootstrap-preflight.bats

1..22
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 1609 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 836 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 1084 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 841 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 685 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 662 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 609 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 777 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 1163 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 698 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 788 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 672 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 1080 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 857 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 2424 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 2313 ms
ok 17 fingerprint: warns with the refresh steps and exits 0 when BKIT_CLOUD_ALLOWLIST_FINGERPRINT is unset # in 926 ms
ok 18 fingerprint: warns naming both fingerprints when they differ, and continues # in 1084 ms
ok 19 fingerprint: reports a match as operator-asserted with the deployed allowlist unverified # in 1124 ms
not ok 20 fingerprint: warns and continues when .bkit/allowlist.json has no fingerprint or jq is absent # in 1486 ms
# (in test file tests/shell/bkit-cloud-bootstrap-preflight.bats, line 268)
#   `[[ "$output" == *"WARNING"* ]]' failed
ok 21 fingerprint: rejects a value that is not 8 hex characters without echoing it # in 1154 ms
ok 22 fingerprint: warns and continues when .bkit/allowlist.json is not valid JSON # in 1464 ms
 ELIFECYCLE  Command failed with exit code 1.
```
