Verdict: CONCERNS
Failures: 3
Fixable: true
Tasks: 2
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Mode `Group`, group 1 (Tasks 1, 2), judged against `build-diff-1-1.md`. No `Deviations` section, no decision records, no earlier verify or remediation logs.
- Test-first audit (`build-tests-green-1-1.md`): `Enforced: true`, `Unproven: 0`, no `Updated tests` or `Already landed` sections. The `not-green` gap stands at `Fixable: true`.
- `delete-still-referenced` (10 entries, `Fixable: null`), decided by `git grep -n 'shared/docs'` over tracked files: the bare-word hits the engine listed (`technology`, `data-schema`, `deployments`, `observability`, `noise`) are topic words or the consumer `docs/{topic}.md` paths, which stay valid (no gap). Path fixtures in the gateguard hook tests and `.bkit/core/engine/tools/instructions.test.ts:106`, the legacy-revision note in `.bkit/core/engine/install/project-docs.ts:117` / `project-docs.test.ts:74`, the self-check in `templates.test.ts:306`, and dated audit reports under `docs/audits/` are different things or history (no gap). The remaining live path references are one `Fixable: true` gap.
- `.bkit/core/engine/install/modules/index.ts`, `version-file.ts` and `checks/after/managed.ts` carry no change in the group diff; their behaviour already holds: `mergeCanonicalHashes` prunes template-set paths (`isTemplateSetPath`, now true for every `docs/{topic}.md`), `.bkit/version` at HEAD holds no retired doc hash, and the stale-marker check skips block-scoped files without a bkit block. Not a gap.
- The `BLOCKED` line in `build-plan-tasks-1-log.md` for the Task 1 test does not satisfy its `DONE WHEN`.
- Group unit and audit tests (11 files, 961 tests) pass: `templates.test.ts`, `template-path-refs.test.ts`, `project-docs.test.ts`, `managed.test.ts`, `shipped-docs-refs.test.ts`, `rules-sync.test.ts`, `dogfood-templates.test.ts`, `instructions.test.ts`, `uninstall.test.ts`, `managed-block.test.ts`, `version-file.test.ts`.
- Lifecycle integration tests (`install.integration.test.ts`, `upgrade.integration.test.ts`, `uninstall.integration.test.ts`): 153 of 154 pass, including all four Task 2 tests and five of six Task 1 tests. The one failure is the `toEqual(settled)` snapshot at `upgrade.integration.test.ts:2436`, with the same `_Mode` and `# cache-bust` diffs the green report shows.
- Task 2 is satisfied: registration, equivalents and unsafe-path tests pass, the ownership audits pass against the moved starters, `.bkit/core/.bkit/templates.md` § Project documents — starters and the index pairs the copy with its row, the retired prose glob is gone from `package.json`, and the dogfood `.agents/docs.md` keeps its Project Documents rows.
- Task 1 stays open on three `Fixable: true` gaps: the not-green idempotency snapshot, the live references to the deleted `.bkit/shared/docs/` path, and the managed-guide section links that point at sections the starters no longer carry.

## Identified Gaps Log

TASK 1: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `migrates legacy ownership without changing project text or core ownership` — not-green: the closing "second run changes nothing" whole-tree snapshot also captures `.claude/bkit-cloud.md` (its `# cache-bust` counter bumps on every upgrade by design) and `.bkit/advisories.md` (`_Mode: check_` vs `_Mode: upgrade_`), so it fails although project docs, index and `.bkit/version` are unchanged; the tests step narrows the idempotency snapshot to exclude those per-run files — Fixable: true
TASK 1: delete-still-referenced — `.bkit/shared/docs/` is deleted but still named as a live path in `.bkit/instructions.md:53` (doc-master surface list), `docs/testing.md:785` (instructions.test.ts corpus description), `docs/templates/bkit-audit-security.md:379` ("shipped from `.bkit/shared/docs/security.md`"), the bkit-repo hook copies `.claude/hooks/bkit-gateguard.cjs:341`, `.codex/hooks/bkit-gateguard.cjs:358`, `.cursor/hooks/bkit-gateguard.cjs:352`, `.opencode/plugin/bkit-gateguard.js:342` (doc-scope comment), and `DETAILS.md:63` (broken `[Project docs](.bkit/shared/docs/)` link; Task 7 also updates DETAILS.md) — Fixable: true
TASK 1: working references — managed guides still send agents to sections the starters no longer carry, though Task 1 moved that guidance into managed homes: `.bkit/core/.bkit/prompts.md:448` → `docs/security.md` § Untrusted Content & Prompt Injection (now `.bkit/core/.bkit/prompts.md` § Untrusted Content & Prompt Injection (threat model)); `.bkit/core/.bkit/templates.md:220` → `docs/testing.md` § Local test sleep prevention and `.bkit/core/.bkit/templates.md:961` → `docs/testing.md` § Tests lock (both now in `.bkit/core/.bkit/workflows.md` § Test and release mechanics); `.bkit/core/.bkit/workflows.md:1720` → `docs/testing.md` § JUnit reports for bkit, a section absent from `.bkit/templates/docs/testing.md` whose rules (one file per runner, no shared file names, unset variable writes nothing) have no managed destination — Fixable: true
