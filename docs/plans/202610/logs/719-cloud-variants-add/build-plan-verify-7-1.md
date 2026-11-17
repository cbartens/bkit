Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 14
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 7

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Mode `Group`, judged against `build-diff-7-1.md` (8 files: `checks/after/{auth,github}.ts` + tests, `dist/checks/after/{auth,github}.js`, `docs/migrations.md`, `docs/observability.md`).
- Test-first audit `build-tests-green-7-1.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`; all 14 planned tests red then green. No `Updated tests`, `Already landed` or `Unproven` sections, so no loosened test.
- Re-run here: `vitest run` on `checks/after/auth.test.ts`, `github.test.ts`, `index.test.ts` → 3 files, 160 tests passed. `pnpm typecheck` (source + tests) exit 0.
- Lint (caller asked, code step could not run it): `pnpm bkit:lint:file` on the four changed source / test files → exit 0, no findings.
- Every `Derived Test Matrix` row for TASK 13 (7 rows) and TASK 14 (7 rows) maps to a test in that task's `DONE WHEN`, and each test exists and passes.
- TASK 14 satisfied: every UPDATE field maps to the diff (readBkitConfig-driven findings, legacy-copy keying via `secrets.BKIT_` sniff, rename finding with inline `gh secret set` / `gh secret delete`, dashboards per-variant secret, docblock, `docs/migrations.md` row, `docs/observability.md` row, `dist/`). Its UPDATE "existing cases to the `BKIT_` names" was not applied literally: the existing `detectCiRouterSecrets` cases use a router copy without `secrets.BKIT_`, so they now exercise the legacy-name path that `719-router-secret-rename-detect-only` requires and still pass; the new describe covers the `BKIT_` names. No gap. `detectCiRouterSecrets` treats an absent / `none` agent as claude (legacy-copy behaviour); not required by the plan either way, recorded only.
- TASK 13: all seven `DONE WHEN` tests pass and the code fields map to the diff (precedence, re-copy action with `runs-on` + `{{NODE_VERSION}}`, Jira early return removed, tracker-neutral nudge, `docs/migrations.md` rows, `dist/`). Left off `Tasks` for the two gaps below (missing observability row from the plan's Documentation Updates table; misleading `cloud-router` text under explicit `none` / `cursor`).
- The tests step deleted the old `jira tracker: no nudge (Jira runs locally only)` test and added fixture lines (agent claude, `id-token: write`, `secrets.BKIT_`) to the first `cloud-router` test without removing an expectation; the deletion matches the plan's Reuse row that DELETEs the Jira early return. No gap.
- Decision records `build-decision-1-*.md` and `build-decision-2-1.md` cover groups 1 and 3; `build-plan-current.md` names TASK 12 (group 6) only. None applies to group 7.

## Identified Gaps Log

2 gaps.

- TASK 13: `docs/observability.md` — doc-update-missing: the plan's Documentation Updates row names "`buildCloudSetupAdvisory` sniffs (TASK 13)" for `docs/observability.md`, and the Verification Plan Observability line lists `cloud-router-tracker-stale`, `cloud-router-codex-missing`, `cloud-router-agent-unset` as `docs/observability.md` rows (TASK 13); § Phase 3 Credential + Migration Findings (`:202-212`) has no `buildCloudSetupAdvisory` row and none of the three finding ids appears anywhere in the file. Add a `buildCloudSetupAdvisory` | `checks/after/github.ts` row listing `cloud-claude-missing-id-token`, `cloud-router-tracker-stale`, `cloud-router-codex-missing`, `cloud-router-agent-unset`, `cloud-router`, `cloud-router-none` and their precedence. — Fixable: true
- TASK 13: `buildCloudSetupAdvisory` in `.bkit/core/engine/checks/after/github.ts` — edge-case-unimplemented: the per-variant `cloud-router` text falls through to the claude branch for any agent that is not `codex` / `opencode`. With the router present and `bkit.cloud.agent` explicitly `none` (the kept test `router presence wins over a stale bkit.cloud.agent=none field`) or `cursor`, the advisory says "post-CI auto-routing is configured for `none`", requires the `BKIT_ANTHROPIC_API_KEY` secret, and points at "`bkit install --auto=none`" — but under `719-cloud-router-dispatches-recorded-agent-only` the router starts no job for `none` or `cursor`. Give those two values text that says the router starts nothing and names `bkit install --auto=<claude|opencode|codex>`, keeping the id `cloud-router` the kept test asserts. — Fixable: true
