# Debug Input — bar-130-ci-lint-scaffolding (attempt 0)

## Session Prompt

`/bkit-debug bar-130 recent gh actions failed in feat branch`

User-flagged action item from ship-summary.md: "Post-merge dev CI investigation — Run [25354307730](https://github.com/cbartens/bkit/actions/runs/25354307730) failed at pnpm setup. Debug the env, cache, or pnpm version resolution. This is the first real CI fire on dev after merge; fix needed to unblock subsequent CI runs."

## Mode

- Debug: local
- Observe: off
- DEBUG_ATTEMPT: 0
- TEST_ATTEMPT: 1

## Branch context

PR #1 (`feat/bar-130-ci-lint-scaffolding` → `dev`) was squash-merged at commit `8646711`. The post-merge CI run on `dev` (run [25354307730](https://github.com/cbartens/bkit/actions/runs/25354307730)) failed at the `Setup pnpm` step in the `bkit-gates` job. There is no open PR (so `gh pr list --state open` returns empty → workflow chose `DEBUG_MODE=local`), and there are no CI runs against the feat branch itself (CI only triggers on push to `main`/`dev` or PRs targeting them).

Because the original `feat/bar-130-ci-lint-scaffolding` branch is squash-merged, rebasing it onto `origin/dev` produces 38 rename/rename conflicts (squashed content already on dev clashes with the original per-task feat commits). The orchestrator created a fresh hotfix branch `fix/bar-130-ci-pnpm` cut from `origin/dev` to land the fix, and logged the rebase friction in `.agents/friction.md` ("Debug workflow — post-ship hotfix on squash-merged feat branch fails rebase").

## Failure summary (from BAR-130 ship comment)

> Post-merge dev CI run failed at `Setup pnpm` (action-level setup failure on the new workflow's first run, not a code defect — flagged for follow-up).

## CI Logs (captured for diagnosis even though DEBUG_MODE=local)

```text
bkit-gates	Setup pnpm	﻿2026-05-05T02:16:27.1779969Z ##[group]Run pnpm/action-setup@v4
bkit-gates	Setup pnpm	2026-05-05T02:16:27.1781116Z with:
bkit-gates	Setup pnpm	2026-05-05T02:16:27.1782306Z   version: 10
bkit-gates	Setup pnpm	2026-05-05T02:16:27.1783170Z   dest: ~/setup-pnpm
bkit-gates	Setup pnpm	2026-05-05T02:16:27.1784086Z   run_install: null
bkit-gates	Setup pnpm	2026-05-05T02:16:27.1785869Z   cache: false
bkit-gates	Setup pnpm	2026-05-05T02:16:27.1787113Z   cache_dependency_path: pnpm-lock.yaml
bkit-gates	Setup pnpm	2026-05-05T02:16:27.1788222Z   package_json_file: package.json
bkit-gates	Setup pnpm	2026-05-05T02:16:27.1789120Z   standalone: false
bkit-gates	Setup pnpm	2026-05-05T02:16:27.1790023Z ##[endgroup]
bkit-gates	Setup pnpm	2026-05-05T02:16:27.3374891Z ##[group]Running self-installer...
bkit-gates	Setup pnpm	2026-05-05T02:16:27.3440282Z Error: Multiple versions of pnpm specified:
bkit-gates	Setup pnpm	2026-05-05T02:16:27.3443778Z   - version 10 in the GitHub Action config with the key "version"
bkit-gates	Setup pnpm	2026-05-05T02:16:27.3447804Z   - version pnpm@10.33.0 in the package.json with the key "packageManager"
bkit-gates	Setup pnpm	2026-05-05T02:16:27.3489622Z ##[error]Error: Multiple versions of pnpm specified:
bkit-gates	Setup pnpm	  - version 10 in the GitHub Action config with the key "version"
bkit-gates	Setup pnpm	  - version pnpm@10.33.0 in the package.json with the key "packageManager"
bkit-gates	Setup pnpm	Remove one of these versions to avoid version mismatch errors like ERR_PNPM_BAD_PM_VERSION
```

## Linear DESCRIPTION (BAR-130)

CI/lint scaffolding install optimisation. Three scopes shipped in v0.1.2:
- Scope A: bkit self-gating (CI workflow, Vale, slop-scan, lint scripts).
- Scope B: installer engine (token resolver, 3-tier writers, marker generalisation, WriteSet dry-run parity).
- Scope C: CLI redesign (`install` verb with module flags, deprecation stubs).

Status: Done. Labels: Debug (was Merged). Issue: <https://linear.app/bartens/issue/BAR-130/ci-lint-etc-scaffolding-install-optimisation>.

## Linear COMMENTS (most recent first, summarised)

- **Ship Workflow (2026-05-05):** PR #1 squash-merged. Post-merge dev CI [25354307730] failed at `Setup pnpm`. Flagged as action item but not a ship gate.
- **Build Workflow (2026-05-04):** 173 tests passed, 1 todo (MED-8 deferred). PR #1 created.
- **Plan Workflow (2026-05-04):** plan split into v4-1/v4-2/v4-3.

## Plan reference

Active plan no longer present (archived to `docs/plans/completed/202605/bar-130-ci-lint-scaffolding-plan{,-1,-2,-3}.md` during ship). Diagnostic should reference archived plans only if relevant; the failure is a CI-config defect, not a plan-execution gap.

## Files of interest

- `.github/workflows/ci.yml` — current workflow (worktree HEAD), `bkit-gates` job, `Setup pnpm` step at lines ~29–32.
- `package.json` — `packageManager: pnpm@10.33.0` declaration at line ~7.
- `.agents/templates/.github/workflows/ci.yml` (or wherever the consumer-distributed template lives) — must mirror any fix so consumers don't inherit the same defect.
- `.agents/scripts/bkit-tokens.ts` — `{{PNPM_VERSION}}` token resolver.

## CI_LOGS sentinel

CI_LOGS = (captured above; protocol-set value would be "N/A" for local mode but raw logs were the user-supplied trigger for this debug run).
