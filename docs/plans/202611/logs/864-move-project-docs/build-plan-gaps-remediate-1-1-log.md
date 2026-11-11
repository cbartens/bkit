Verdict: FAIL
Strategy: STANDARD
Fixed: 2

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

BLOCKED — Gap 1: upgrade.integration.test.ts "migrates legacy ownership without changing project text or core ownership" not-green — the closing toEqual(settled) snapshot captures .claude/bkit-cloud.md (# cache-bust counter bumps on every upgrade by design) and .bkit/advisories.md (_Mode: check_ vs _Mode: upgrade_); no source change can make it pass without breaking that design, and only the planned test may narrow its snapshot
DONE — Gap 2: delete-still-referenced — removed live .bkit/shared/docs/ references (.bkit/instructions.md, docs/testing.md, docs/templates/bkit-audit-security.md, four gateguard hook copies, DETAILS.md link now .bkit/templates/docs/) (see git diff)
DONE — Gap 3: working references — pointed prompts.md, templates.md, workflows.md (core + installed copies) at managed sections; JUnit rules folded into workflows.md "Failure count from JUnit reports" (.bkit/core/.bkit/*.md, .bkit/*.md)
DONE — bkit:generate ran clean
BLOCKED — Group gate: bkit:gate:changed exit 1, 1 failed | 7407 passed; the one failure is the Gap 1 planned test (migrates legacy ownership...), which only a planned-test edit can fix
