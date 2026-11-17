# Docs Update

## Files Modified

- `docs/deployments.md`
- `docs/security.md`
- `docs/setup.md`
- `docs/technology.md`

## Drift Resolved

- `docs/deployments.md` — sync: § Pre-push checklist gains the `direnv load` paragraph (the inner run goes through `direnv exec .` when the repo has an `.envrc`, `direnv` is on `PATH` and `CI` is unset; an untrusted `.envrc` blocks before `bkit check`; the tooling keys are unset on every path), pointing at `.bkit/templates.md` § Git hooks — Husky as the contract. Reorganize, compress: no change needed. Cross-references: links to `docs/security.md` § `.bkit/.env` scope.
- `docs/security.md` — sync: § `.bkit/.env` scope says the pre-push gate unsets the listed keys plus every key `.bkit/.env` names, so they stay out of the gate and `tmp/pre-push.log`, and that a new tooling key goes in this list and the hook's fixed list together (the hook comment cites this section as the list's home). Reorganize, compress: no change needed. Cross-references: links to `.bkit/templates.md` § Git hooks — Husky.
- `docs/setup.md` — sync: § Local environment variables says the hook loads `.envrc` itself, that `direnv allow .` is needed once in every folder that pushes (linked worktrees included) or the push blocks, and that `bkit worktrees setup` allows a byte-identical `.envrc`. Reorganize, compress: no change needed.
- `docs/technology.md` — sync: the `Pre-push hook` row names the `direnv exec .` load and the untrusted-`.envrc` block. Reorganize, compress: no change needed.

History read: `git log --oneline --stat dev..HEAD` (not shallow; local `dev` is the base because it is ahead of `origin/dev` and unpushed).

## Unresolved Coverage

None. Topic check for the shipped files:

- `docs/technology.md`, `docs/security.md`, `docs/deployments.md`, `docs/setup.md` — present, indexed, project content; updated above.
- `docs/testing.md` — present, indexed, project content; the new cases live in the existing `audits/templates/husky-pre-push.integration.test.ts`, `checks/tips/catalogue.test.ts`, `checks/after/index.test.ts` and `commands/workflow/worktrees.integration.test.ts`, so no tier or inventory change.
- `docs/observability.md` — present; not applicable, because `tmp/pre-push.log` behaviour did not change apart from the gate's environment.
- `docs/architecture.md`, `docs/data-schema.md`, `docs/design.md`, `docs/noise.md` — not applicable: no service boundary, schema, UI or signal downgrade changed.

## Pending Items

- `922-pre-push-load-challenge-low-bkit-templates-husky-pre-push-42` — a trusted `.envrc` that fails to load is reported as "not trusted".
- `922-pre-push-load-challenge-low-bkit-core-engine-checks-tips-catalogue-ts-480` — the `pre-push-direnv` tip goes silent for any hook that mentions `direnv exec` anywhere.
- `922-pre-push-load-challenge-low-bkit-core-engine-checks-tips-catalogue-ts-475` — the `pre-push-direnv` tip asks a hook without the log block to replace that block.
- `922-pre-push-load-challenge-low-bkit-core-engine-audits-templates-husky-pre-push-integration-test-ts-1282` — the `direnv not on PATH` test errors on a `PATH` holding a file entry or an unreadable directory.
- `922-pre-push-load-challenge-low-skills-lock-json-29` — `skills-lock.json` `find-skills.computedHash` is empty.
- `922-pre-push-load-challenge-low-bkit-core-engine-commands-workflow-worktrees-ts-651` — worktree setup claims the push will block on machines where the hook skips direnv.
- `922-pre-push-load-challenge-low-bkit-core-engine-checks-after-github-ts-358` — `buildGithubProjectTokenScopeAdvisory` probes the wrong token inside the pre-push run.

## Blockers

None.
