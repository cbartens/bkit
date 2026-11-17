Verdict: CONCERNS
Strategy: PIVOT
Fixed: 6

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

DONE — Gap 6: instructions-coverage — updated bkit-plan local entry (.bkit/instructions.md)
DONE — Gap 1: debug context-related-N.md excluded from documentation warnings (.bkit/core/engine/commands/workflow/summary.ts, summary.test.ts)
DONE — Gap 2: bkit check drift — ran upgrade, check exits 0 (docs/templates/bkit-plan.md, .bkit/version)
DONE — Gap 3: docs/observability.md project-docs-cleanup row and full exclusion set
DONE — Gap 4: docs/migrations.md row updated to LEGACY_STARTER_DIGEST_HISTORY and current registration rule
DONE — Gap 5: unindexed doc with ambiguous wrapper no longer told to run bkit upgrade (.bkit/core/engine/checks/after/tools.ts, tools.test.ts)
DONE — Gap 7: templates.test.ts dogfood — passes after upgrade refresh
BLOCKED — Group gate: bkit tests changed exit 1 only from two unrelated flakes (tests-lock.integration ENOTEMPTY tmp cleanup; test-file-script.integration SIGTERM timing); both pass 30/30 on isolated rerun; branch does not touch them (/private/tmp/claude-501/h3-final3.log)
