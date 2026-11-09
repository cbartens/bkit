Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

BLOCKED — TASK 1: test `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `migrates legacy ownership without changing project text or core ownership` — its final "second run changes nothing" snapshot compares every file, but every `bkit upgrade` bumps the `# cache-bust` counter in `.claude/bkit-cloud.md` (cloud-env.ts renderCloudCacheBust, by design) and `bkit check` before the snapshot writes `_Mode: check_` into `.bkit/advisories.md`; the project docs, index and `.bkit/version` are identical across the runs, so every assertion before that line passes
DONE — TASK 1: Move the ten project doc starters to .bkit/templates/docs — starters moved without markers, project-docs.ts (catalog, digests, wrapper migration, index rows) wired into install/upgrade/uninstall, guide docs and migrations.md row added (.bkit/core/engine/install/project-docs.ts)
DONE — TASK 2: Reconcile present canonical docs into the index — audits/tests updated, dogfood entries added, retired prose glob removed, instructions registry updated, bkit:generate and static gate pass (.bkit/core/engine/audits/repo/dogfood-templates.test.ts)
