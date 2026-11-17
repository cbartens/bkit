Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 21, 22, 24
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 10

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Mode: Group. Judged against `build-diff-10-1.md` (changes since `ceb43f86f`; `git diff ceb43f86f --stat` lists the same 17 files) and the tree at `c9f80bdb7`.
- Deviations: the brief's owner text ("fix whatever needs fixing in #719 see `build-plan-verify-holistic.md`") was applied by checking that report's four closed gaps against this group's diff. Gap 1 of that report (`docs/deployments.md:528`) is open again; see the `GROUP 10` gap.
- Decision record `build-decision-4-1.md`: Q1 (TASK 23) and Q2 (TASK 24) are `Decision: Fix now`. They schedule work and accept no gap. `build-decision-1-1.md` .. `1-3.md` (`Try again`) and `2-1.md` (`Fix now`) belong to earlier groups.
- TASK 21: satisfied. `bkit_gate` picks `secret_state` with `[ -n "${!secret_var:-}" ]` and never expands the value; the adopted copy matches the template (they differ only in `runs-on` / `node-version-file`). The test passes.
- TASK 22: satisfied. The dev arm calls `bkit_gate ""` when `node_modules/.bin/bkit` is absent, so it logs the `bkit-unavailable` warning, writes the summary row, sets `skip=true` and writes no counter row. The test passes. Not in `DONE WHEN`: the comment above it (template `:505-515`) still says "No bkit ... is the no-FID no-op below", and the `if [ -x node_modules/.bin/bkit ]` that follows is now always true.
- TASK 23: not satisfied. The install now runs from `dev` and `docs/security.md` § CI Auto-Route Trust matches the decision, but the checkout order deletes `pr-head/` on a real runner. The planned test passes because it checks only the install directory's ref.
- TASK 24: satisfied. `ROUTER_ONLY_KEYS` drops `BKIT_OPENAI_API_KEY`, `dist/install/cloud-env.js` is rebuilt, the `.env.example` row stays (owner's choice), and `docs/security.md` § Secrets Management (`:78`, `:101`, below `bkit:end`) names the drop. The test passes.
- Test-first audit (`build-tests-green-10-1.md`): `Enforced: true`, 0 gaps, 0 unproven, no `Updated tests` or `Already landed` section. The tasks step also rewrote two existing `workflow-templates.integration.test.ts` assertions (`(b)` and `(1b)`) from `node_modules/.bin/bkit fids parse` to `bkit_cli fids parse` with the same arguments. These follow the renamed call and loosen nothing.
- Verification run: `pnpm vitest run` on `cloud-ctx-step.integration.test.ts`, `workflow-templates.integration.test.ts`, `cloud-env.test.ts` and `dogfood-templates.test.ts`: 4 files, 266 tests passed. The `.bkit/version` hashes for `docs/deployments.md` and both `bkit-preflight.sh` copies match the files on disk.
- Not a gap: `.bkit/friction.jsonl` gained one orchestrator row (`build-challenge-fix-brief-lacks-owner-decision`).

## Identified Gaps Log

2 gaps.

- TASK 23: `.bkit/templates/.github/workflows/bkit-cloud.yml:172-187` (and the adopted `.github/workflows/bkit-cloud.yml`) — the `pr-head` checkout runs BEFORE the workspace-root `dev` checkout. `actions/checkout` at the pinned SHA (`src/git-source-provider.ts:31-68`, `src/git-directory-helper.ts:28-31`, `:117-120`) prepares an existing workspace that has no `.git` by deleting its contents, so the root checkout deletes `pr-head/`. On every real run `HEAD_DIR=pr-head` is gone: `Select agent job` reads no `pr-head/package.json` (agent `none`, nothing dispatches), `bkit_gate` reads tracker `none`, and `bkit_cli` fails its `cd`. The router therefore does not match the owner's decision (`build-decision-4-1.md` Q1). No test catches it: `cloud-ctx-step.integration.test.ts` never sets `HEAD_DIR` (it defaults to `.`), and the new `workflow-templates.integration.test.ts` case checks only the install directory's ref. Fix: put the root `dev` checkout first and the `path: pr-head` checkout after it (the nested-checkout order `actions/checkout` documents), and add a test that the root checkout precedes every `path:` checkout — Fixable: true
- GROUP 10: `docs/deployments.md:528` regressed to "ships the `{{CLOUD_RUNNER}}` placeholder in both jobs" — the template has four (`context`, `claude`, `opencode`, `codex`). The holistic fix (`4c3518915`) edited only the installed copy inside the `bkit:start` / `bkit:end` block, and this group's `bkit upgrade` re-rendered it from the unchanged source `.bkit/shared/docs/deployments.md:528`. Fix the source line, then re-render — Fixable: true
