Enforced: true
Red: 0
Accepted: 1
Updated: 0
Gaps: 1

<!-- verdict:end -->

# Tests Red — group 4, attempt 2

Plan: `docs/plans/202611/803-close-codex-opencode-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 8 | `tests/shell/bkit-cloud-bootstrap-preflight.bats` "fingerprint: warns and continues when .bkit/allowlist.json has no fingerprint or jq is absent" | vacuous | "fingerprint: warns and continues when .bkit/allowlist.json has no fingerprint or jq is absent" passes at its red, so it proves nothing |
| 11 | `tests/shell/bkit-cloud-bootstrap-preflight.bats` "fingerprint: warns and continues when .bkit/allowlist.json has no fingerprint or jq is absent" | passed-accepted | passes; accepted by the tests step: hook already warns when jq is missing; on this host jq is not in /usr/bin so the old test also passed; the test now builds a jq-free PATH (NO_JQ_BIN) and asserts jq is absent from it |

## Gaps

- TASK 8 `tests/shell/bkit-cloud-bootstrap-preflight.bats` "fingerprint: warns and continues when .bkit/allowlist.json has no fingerprint or jq is absent" `vacuous` — "fingerprint: warns and continues when .bkit/allowlist.json has no fingerprint or jq is absent" passes at its red, so it proves nothing

## Lint output — `tests/shell/bkit-cloud-bootstrap-preflight.bats`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern tests/shell/bkit-cloud-bootstrap-preflight.bats

```

## Runner output — `tests/shell/bkit-cloud-bootstrap-preflight.bats`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs tests/shell/bkit-cloud-bootstrap-preflight.bats

1..22
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 389 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 686 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 364 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 373 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 685 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 360 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 163 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 866 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 382 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 396 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 516 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 413 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 392 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 734 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 864 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 878 ms
ok 17 fingerprint: warns with the refresh steps and exits 0 when BKIT_CLOUD_ALLOWLIST_FINGERPRINT is unset # in 409 ms
ok 18 fingerprint: warns naming both fingerprints when they differ, and continues # in 389 ms
ok 19 fingerprint: reports a match as operator-asserted with the deployed allowlist unverified # in 688 ms
ok 20 fingerprint: warns and continues when .bkit/allowlist.json has no fingerprint or jq is absent # in 416 ms
ok 21 fingerprint: rejects a value that is not 8 hex characters without echoing it # in 366 ms
ok 22 fingerprint: warns and continues when .bkit/allowlist.json is not valid JSON # in 551 ms
```
