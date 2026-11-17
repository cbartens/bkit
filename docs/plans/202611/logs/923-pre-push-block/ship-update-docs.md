# Docs Update

## Files Modified

- `docs/deployments.md`
- `docs/testing.md`

## Drift Resolved

- `docs/deployments.md` (sync, compress, cross-references):
  - § Pre-push checklist, CI-suppressor HEAD guard: added the full-page case (1000 open PRs share the head name, none from this repo → blocked) and the shared open-PR lookup the guard now reads, with the same-repo and push-target-fork rule.
  - New paragraph `PR conflict check (pre-push, ...)`: what blocks (trial merge of the pushed commit against the freshly fetched base, `merge=union` ignored as on GitHub, also on a min push), what only warns (missing or failing `gh`, full page, shallow clone, failed fetch, other `git merge-tree` failure), the `BKIT_PR_CONFLICT_CHECK=false` switch that `/bkit-ship` and `/bkit-debug` set, and the `pre-push-pr-conflict` tip. Links to `.bkit/templates.md` § Git hooks — Husky for the full contract instead of copying it.
- `docs/testing.md` (sync): two rows in the audit-test table for `audits/templates/husky-pre-push.integration.test.ts` (`.husky/pre-push PR conflict`) and `checks/tips/catalogue.test.ts` (the `pre-push-pr-conflict` tip). The ship and debug switch tests already sit under the existing `ship-invariants.test.ts` and `debug-ci-evidence.integration.test.ts` entries, so they were not repeated.
- `docs/security.md`: no change needed. The edits #920 made on `dev` are kept as merged.
- `.bkit/templates.md` (and its source `.bkit/core/.bkit/templates.md`) already describe the check from the build; they are outside this agent's `docs/` scope and were not touched.
- Memory (`MEMORY.md`): pointers only, no duplicate or stale content found, no change.
- Shallow check: `git rev-parse --is-shallow-repository` printed `false`, so the full history was read.
- One process slip: the first `docs/deployments.md` edit went through a shell script rather than the edit tool. The result was reviewed against `.bkit/authoring.md` § All Agent-Read Files and § Docs and conforms; the later edit used the edit tool.

## Unresolved Coverage

None. Topic check for the shipped files (a hook script, a tips entry, two workflows):

- testing and deployments: relevant, covered and updated.
- security: relevant only for the deferred `PR_BASE` name check (below); the doc already holds the pre-push section and nothing shipped changes its contract.
- architecture, technology, data-schema, observability, design, noise, setup: not applicable, the change adds no topology, dependency, schema, logging, UI or setup step.

## Pending Items

Six open LOW build-challenge deferrals for `923-pre-push-block` (from `ship-pending-items.md`), for human review:

- `.bkit/templates/.husky/pre-push:250` (and `.husky/pre-push:307`): `echo "$PR_MERGE_OUT"` turns git's quoted `\033` in a file name back into a raw ESC byte under `sh`; use `printf '%s\n'`.
- `.bkit/templates/.husky/pre-push:149` (and `.husky/pre-push:204-207`): the lookup keeps only the newest same-repo PR, so a clean PR to `main` hides a conflicting older PR to `dev`; check every open PR's base.
- `.bkit/templates/.husky/pre-push:239` (and `.husky/pre-push:296`): the base fetch recurses into submodules; add `--no-recurse-submodules`.
- `.bkit/core/workflows/bkit-plan.md:480` and `.bkit/core/workflows/bkit-design.md:534`: the feature-branch summary pushes lack `BKIT_PR_CONFLICT_CHECK=false`, so a conflicting open PR blocks bookkeeping pushes.
- `.bkit/templates/.husky/pre-push:248`: a base branch name such as `base;id` is printed unchecked in the Fix line; validate `PR_BASE` with `git check-ref-format` and a character allow-list.
- `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:466`: the fork-PR test's stub `gh` needs `jq`, so without it the test passes whatever the filter does.

Once these land, `docs/deployments.md` § PR conflict check and `.bkit/templates.md` § Git hooks need the multi-PR and base-name rules added.

## Blockers

None
