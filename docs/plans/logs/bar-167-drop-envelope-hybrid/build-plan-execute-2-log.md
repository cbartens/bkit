Verdict: PENDING

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — Task 17: Add Group A full-ownership markers — All 12 Group A template files now have exactly one bkit:start and one bkit:end marker (.vale/styles/House/*.yml + .agents/docs.md + docs/plans/template.md added; others already present)
DONE — Task 17a: Verify markers already present on reclassified markered-text files — All 5 files (.claude/hooks/preflight.sh, .cursor/hooks/preflight.sh, gitignore, .prettierignore, .husky/pre-commit) confirmed bkit:start count=1
DONE — Task 18: Add Group B partial-ownership markers — ci.yml: # bkit:start at line 23 above Install Dependencies, # bkit:end at line 51 below Run Bkit Check; .vale.ini: # bkit:start at line 1 wrapping StylesPath/Packages/MinAlertLevel/House enable (4 required keys confirmed inside block)
DONE — Task 18a: Verify .husky/pre-push markers — markers at lines 2-6 confirmed, no expansion needed
DONE — Task 18b: Verify slop-scan.config.json required core rules — all 10 required keys present with enabled:true; no delta from plan
DONE — Sub-gate 2A: Manifest reclassification readiness verified — Task 18b complete; PREREQ-tagged integration tests blocked until Task 19
DONE — Task 19: Simplify bkit-manifest.ts schema — ManifestEntry.tier removed; format field added with values json|markered-text|byte-equal-text; all 6 module manifests updated; bkit-manifest.test.ts updated to use format assertions; pnpm tsc --noEmit clean
DONE — Task 20: Single dispatch on entry.format in install/check/uninstall — bkit-uninstall.ts buildDecisionTable updated to switch on entry.format; bkit-modules.test.ts single-dispatch format tests added; pnpm tsc --noEmit clean
DONE — Task 21: Phase 2 advisory tier2-text-drift — detectTier2TextDrift added to bkit-preflight.ts; extractManagedBlock imported; runPreflight extended to scan 8 markered-text paths; advisory follows [Context] Message format; pnpm tsc clean
DONE — Task 22: bkit-templates.test.ts (NEW) — 54 tests: Group A html-comment + hash-comment marker presence; Group B ci.yml + .vale.ini partial-ownership markers; slop-scan.config.json 10 required rules; pre-push pre-existing markers — all green
DONE — Task 23: Tier-3 drift regression test — detectTier2TextDrift tests added to bkit-modules.integration.test.ts; ci.yml missing bkit check step fires tier2-text-drift; boundary documented for indented-marker limitation
DONE — Task 23a: heavy-customised ci.yml survival test — 3 sub-tests added to bkit-modules.upgrade.integration.test.ts: fixture exists; outside-marker consumer-job preserved; inside-marker drift detection boundary documented
DONE — Task 23b: .husky/pre-push marker survival test — 4 sub-tests in bkit-modules.integration.test.ts: fixture exists; has markers; bkit-repo only lines below marker; runGitHooksModule preserves consumer lines + bkit block byte-equal to template
