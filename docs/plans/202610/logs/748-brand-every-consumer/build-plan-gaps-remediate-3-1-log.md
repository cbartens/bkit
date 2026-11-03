Verdict: FAIL
Strategy: STANDARD
Fixed: 0

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

BLOCKED — Gap 1: Task 7 upgrade.integration.test.ts "copy-and-own migration writes record no canonical hash and a second upgrade writes nothing" — the fault is the planned test assertion (line 1059 matches unrelated advisories naming .husky/pre-push); the code meets DONE WHEN, and a code step may not edit a planned test, so the tests step must scope it to the migration log line
BLOCKED — Gap 2: Task 8 upgrade.integration.test.ts "a second template-file migration and a dry run write and move nothing" — the fault is the planned test snapshot (includes .claude/bkit-cloud.md, whose cache-bust line renderCloudCacheBust bumps by design); code is correct, and a code step may not edit a planned test, so the tests step must exclude that file
