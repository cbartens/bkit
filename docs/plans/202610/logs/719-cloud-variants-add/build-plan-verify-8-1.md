Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 15, 17
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 8

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- TASK 15 satisfied: `cloudTipText` + optional `resolve(cwd)` on `SetupTip` (`.bkit/core/engine/checks/tips/catalogue.ts`), applied in `collectTips` (`index.ts:127`). Both `TEST FIRST` tests exist and pass, with the existing cloud cases; `npx vitest run .bkit/core/engine/checks/tips/` plus `workflow-shape.test.ts` and `shipped-docs-refs.test.ts`: 5 files, 665 tests passed. Both Derived Test Matrix rows owned by TASK 15 are covered. Test-first audit (`build-tests-green-8-1.md`): `Enforced: true`, 0 gaps, 0 unproven.
- TASK 16 not satisfied: its DONE WHEN checks pass (forbidden-text grep prints nothing; matrix header `Agent | Ways to launch | not supported`, one row each for Claude, Codex, Cursor, OpenCode; `not yet verified live` lines at `.bkit/core/.bkit/cloud.md:409-411` name Linear / Jira router dispatch, the codex router job and the Cursor Jira guard; `workflow-shape.test.ts` and `shipped-docs-refs.test.ts` pass). But two edits are missing from files the task rewrites (see gaps log). Extra edits beyond the task's fields (`pipeline.md:42` `--auto` list, `templates.md:629` reworded so the grep is clean) are consistent with the task's intent.
- TASK 17 satisfied on intent; its DONE WHEN cannot pass as literally written. The grep is a substring match, so `-e OPENCODE_PROVIDER_KEY` also hits `OPENCODE_PROVIDER_KEY_SENTINEL = "@@OPENCODE_PROVIDER_KEY@@"` at `.bkit/core/engine/install/modules/opencode.ts:233,288`. That sentinel is a placeholder in `.bkit/shared/.opencode/opencode.json` that install replaces with the provider id (for example `openrouter`), not a secret name, and it predates this plan (`d561683a1`). Renaming it would touch the shipped `.bkit/shared/.opencode/opencode.json`, which no task names. The task's named comments (`:163`, `:225`) now name the provider's `BKIT_` secret. The remaining hit, `docs/security.md:22`, sits inside the managed block (`:1-62`), which the DONE WHEN excludes. `pnpm build leaves dist/ matching its sources` checked by transpiling with `tsc --outDir` to a scratch dir: `dist/checks/tips/catalogue.js`, `dist/checks/tips/index.js` and `dist/install/modules/opencode.js` are byte-identical. Docs rows done: `docs/deployments.md` lane section, `docs/security.md` `:90` row and § CI Auto-Route Trust paragraphs, `.bkit/shared/docs/security.md:22`, `docs/testing.md` rows. TASK 18's holistic check should apply the same reading of this grep.
- Documentation Updates rows owned by group 8: every row is done except the `.bkit/core/.bkit/install.md` `requires tracker=github` item (gap 1).
- Decision records `build-decision-1-1..1-3` (group 1) and `build-decision-2-1` (group 3) do not touch group 8.
- Out-of-scope find (not a gap, no task names it): `docs/deployments.md:528` says the template ships `{{CLOUD_RUNNER}}` "in both jobs"; the template now has four jobs (`.bkit/core/.bkit/templates.md` says "all four jobs").

## Identified Gaps Log

Gaps: 2

- TASK 16: `.bkit/core/.bkit/install.md:197` still reads "`bkit install --auto=opencode` requires `tracker=github`." The task's UPDATE line names this sentence (`requires tracker=github`, `:187-193`) and the goal is any variant with any wired tracker; delete or reword it (every `--auto` variant works with GitHub, Linear or Jira; only tracker `none` refuses) — Fixable: true
- TASK 16: `.bkit/core/.bkit/cloud.md:563` and `:578` (§ Claude — workload identity federation) still name the repo secret `ANTHROPIC_API_KEY` ("stores no long-lived `ANTHROPIC_API_KEY`", "`gh secret delete ANTHROPIC_API_KEY`"). The router and the `anthropic-api-key-shadows-federation` finding (`.bkit/core/engine/checks/after/auth.ts:243-262`) now use `BKIT_ANTHROPIC_API_KEY`, so step 4 tells a consumer to delete the wrong secret and federation stays shadowed; rename both to `BKIT_ANTHROPIC_API_KEY` per owner decision `719-cloud-router-secrets-bkit-prefixed` — Fixable: true
