Enforced: true
Red: 0
Accepted: 1
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 4, attempt 3

Plan: `docs/plans/202611/803-close-codex-opencode-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 8 | `tests/shell/bkit-cloud-bootstrap-preflight.bats` "fingerprint: warns and continues when .bkit/allowlist.json has no fingerprint or jq is absent" | passed-accepted | passes; accepted by the tests step: the fingerprint block already exists in .claude/hooks/bkit-cloud-bootstrap.sh:67-79 (landed before the tests ran); the test already reaches both halves (no fingerprint key, and a jq-free PATH asserted jq-absent), so no rewrite would make it fail without weakening it |

## Gaps

None.

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
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 980 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 1419 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 1344 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 879 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 765 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 1434 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 649 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 1609 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 1120 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 1123 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 1064 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 1115 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 1988 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 1450 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 3340 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 2176 ms
ok 17 fingerprint: warns with the refresh steps and exits 0 when BKIT_CLOUD_ALLOWLIST_FINGERPRINT is unset # in 1704 ms
ok 18 fingerprint: warns naming both fingerprints when they differ, and continues # in 1741 ms
ok 19 fingerprint: reports a match as operator-asserted with the deployed allowlist unverified # in 1885 ms
ok 20 fingerprint: warns and continues when .bkit/allowlist.json has no fingerprint or jq is absent # in 1903 ms
ok 21 fingerprint: rejects a value that is not 8 hex characters without echoing it # in 1487 ms
ok 22 fingerprint: warns and continues when .bkit/allowlist.json is not valid JSON # in 1078 ms
```
