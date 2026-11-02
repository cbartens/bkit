Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 6: Rename Vale style House -> Bkit — templates, own copy, engine text, docs, tests moved (.bkit/templates/.vale/styles/Bkit, .vale/styles/Bkit)
DONE — TASK 7: Unhashed write class and husky / CI token migration — WriteEntry.unhashed, migrateBrandedFileTokens, hash skips, templates.md and version-file.ts exception text, migrations.md row (.bkit/core/engine/install/modules/core.ts)
BLOCKED — TASK 7: test `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `copy-and-own migration writes record no canonical hash and a second upgrade writes nothing` — asserts the full second-upgrade output never contains ".husky/pre-push", but the advisories printed on every upgrade of a bare scratch consumer name it ("copy .bkit/templates/.husky/pre-push to .husky/", husky-missing and dependency-audit advisories); every other assertion in the test passes
DONE — TASK 8: Upgrade migration for the renamed CI script files — CI_SCRIPT_UNITS, SHIPPED_CI_SCRIPT_HASHES, migrateBrandedTemplateFiles, path-token rewrite, migrations.md rows (.bkit/core/engine/install/modules/core.ts, .bkit/core/engine/checks/after/ci-yml.ts)
BLOCKED — TASK 8: test `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `a second template-file migration and a dry run write and move nothing` — snapshotTree includes .claude/bkit-cloud.md, which every upgrade regenerates with a new "# cache-bust DATE-N" counter (renderCloudCacheBust), so the second-run snapshot can never equal the first; the only differing hunk is that line, scripts/ci and the hooks are unchanged
DONE — TASK 13: Second-upgrade check scoped to the branded line — replacement test passes, old test gone (.bkit/core/engine/commands/install/upgrade.integration.test.ts)
DONE — TASK 14: Second-run snapshot leaves out .claude/bkit-cloud.md — replacement test passes, old test gone (.bkit/core/engine/commands/install/upgrade.integration.test.ts)
