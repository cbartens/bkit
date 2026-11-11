Verdict: PASS
Strategy: STANDARD
Fixed: 4

<!-- verdict:end -->

# Plan Gaps

## Remediation Log
DONE — Gap 1: delete-still-referenced — README sample list in source .bkit/core/.bkit/README.md now names the example files (.bkit/core/.bkit/README.md)
DONE — Gap 2: integration test line 88 expected .prettierignore — now prettierignore.example (.bkit/core/engine/install/template-copies.integration.test.ts)
DONE — Gap 3: templates.md reference updates ported to source; bkit upgrade re-rendered, check clean (.bkit/core/.bkit/templates.md)
DONE — Gap 4: oxlint dotfile-name note recorded in source templates.md (.bkit/core/.bkit/templates.md)
DONE — Group gate: bkit tests changed exit 0, all stages passed
