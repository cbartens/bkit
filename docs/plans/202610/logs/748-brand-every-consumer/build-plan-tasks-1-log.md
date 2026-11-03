Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 1: Rename lint:prose/slop:delta — renamed in engine, templates, own copies, package.json; detectValeMissing reads bkit:lint:prose; targeted tests and bkit:gate:static pass (.bkit/core/engine/checks/after/tools.ts)
DONE — TASK 2: launchd templates renamed — git mv to bkit-launchd.plist / bkit-launchd.env.example; templates.md and catalogue.ts updated (.bkit/templates/scripts/launchd/)
DONE — TASK 3: graph* -> bkit:graph* — package.json, templates, scripts, docs/capabilities.md regenerated; branding.test.ts passes; bkit:graph:check passes (.bkit/core/engine/audits/templates/branding.test.ts)
DONE — restore check: the four named planned tests have no diff against HEAD, so nothing to restore; both test files pass (176 tests). Verdict stays PASS.
