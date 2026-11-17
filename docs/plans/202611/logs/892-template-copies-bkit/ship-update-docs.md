Verdict: PASS
Failures: 0

<!-- verdict:end -->

# Docs Update

## Files Modified

- `.bkit/core/.bkit/templates.md`
- `.bkit/templates.md`

## Drift Resolved

- `.bkit/core/.bkit/templates.md` (source) and `.bkit/templates.md` (mirror), all four passes. Sync: § Contract bullet (line 95) named the `.prettierignore` template, which is now `prettierignore.example`; changed to the new name. Reorganize, compress and cross-reference passes found nothing to change.
- Already in sync from this cycle, checked and left alone: `.bkit/templates.md` sample table (lines 56-57), § Prettier (line 340), § lint-staged (line 348: rename, removal of the old sample names, the one-line missing-config warning), § Oxlint (line 401: oxlint check result); `.bkit/README.md:269`; `docs/testing.md:787`; `docs/migrations.md` (migration removed, no row, matches the code); `docs/decisions.jsonl` (not edited by this step).
- `rg` for the old sample paths (`templates/.lintstagedrc`, `templates/.prettierignore`) outside `docs/plans/**`, `*.jsonl`, `dist/` and `CHANGELOG.md` history: no hits. `.bkit/install.md` has no reference to the old paths.
- `node dist/cli.js check` exits 0 after the edit.
- `CHANGELOG.md` left alone: it has no unreleased section, and release entries are written in the release-prepare commit.
- Memory (`MEMORY.md`): pointers only, no duplicate or stale content for this change. No edit.
- Git history: repo is not shallow (`git rev-parse --is-shallow-repository` printed `false`).

## Pending Items

Four open LOW deferrals from `ship-pending-items.md`, for human review:

- `892-template-copies-bkit-challenge-low-bkit-core-engine-install-template-copies-ts-165`: obsolete. The `unhashed: true` finding targeted the lint-staged migration that task 5 removed (the deferred sweep confirms no `migrateLintStagedSample` remains). Close as obsolete.
- `892-template-copies-bkit-challenge-low-bkit-core-docs-templates-bkit-audit-adoption-md-116`: adoption audit Step 9 diffs each template against the same path at the root, so the renamed samples read as unreconciled. Needs `.bkit/core/docs/templates/bkit-audit-adoption.md` and the `docs/templates/` copy changed; outside the doc-sync scope.
- `892-template-copies-bkit-challenge-low-bkit-core-hooks-gateguard-engine-js-18`: `GATE_CONFIG_PATTERNS` still match only the old dotfile basenames.
- `892-template-copies-bkit-challenge-low-bkit-core-engine-audits-templates-template-path-refs-test-ts-61`: the template-path guard no longer forbids naming `.prettierignore` / `.lintstagedrc.json` in workflows and prompts.

## Blockers

None
