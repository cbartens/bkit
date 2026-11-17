Enforced: true
Verdict: PASS
Gaps: 0
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
| 8 | `tests/shell/bkit-cloud-bootstrap-preflight.bats` "fingerprint: warns and continues when .bkit/allowlist.json has no fingerprint or jq is absent" | passed-accepted | passed |
| 8 | `tests/shell/bkit-cloud-bootstrap-preflight.bats` "fingerprint: rejects a value that is not 8 hex characters without echoing it" | red | passed |
| 8 | `tests/shell/bkit-cloud-bootstrap-preflight.bats` "fingerprint: warns and continues when .bkit/allowlist.json is not valid JSON" | red | passed |
| 9 | `.bkit/core/engine/checks/before/files.test.ts` "reports an adopted bootstrap that never reads BKIT_CLOUD_ALLOWLIST_FINGERPRINT" | red | passed |
| 9 | `.bkit/core/engine/checks/before/files.test.ts` "accepts a customised bootstrap that reads the variable" | red | passed |
| 9 | `.bkit/core/engine/checks/before/files.test.ts` "stays silent when no bootstrap is adopted" | red | passed |
| 9 | `.bkit/core/engine/commands/install/check.integration.test.ts` "bkit check reports a stale adopted cloud bootstrap with the template block to copy" | red | passed |
| 9 | `.bkit/core/engine/commands/install/doctor.integration.test.ts` "bkit doctor lists a stale adopted cloud bootstrap" | red | passed |
| 11 | `tests/shell/bkit-cloud-bootstrap-preflight.bats` "fingerprint: warns and continues when .bkit/allowlist.json has no fingerprint or jq is absent" | passed-accepted | passed |

## Gaps

None.

## Already landed

- Task 8 `tests/shell/bkit-cloud-bootstrap-preflight.bats` "fingerprint: warns and continues when .bkit/allowlist.json has no fingerprint or jq is absent" — passed at the group's red, and the tests step accepted it: the fingerprint block already exists in .claude/hooks/bkit-cloud-bootstrap.sh:67-79 (landed before the tests ran); the test already reaches both halves (no fingerprint key, and a jq-free PATH asserted jq-absent), so no rewrite would make it fail without weakening it; no red is due
- Task 11 `tests/shell/bkit-cloud-bootstrap-preflight.bats` "fingerprint: warns and continues when .bkit/allowlist.json has no fingerprint or jq is absent" — passed at the group's red, and the tests step accepted it: hook already warns when jq is missing; on this host jq is not in /usr/bin so the old test also passed; the test now builds a jq-free PATH (NO_JQ_BIN) and asserts jq is absent from it; no red is due
