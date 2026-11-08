# Docs Update

## Files Modified

None. The build already updated every `docs/*.md` file this cycle touches (`docs/architecture.md`, `docs/capabilities.md`, `docs/deployments.md`, `docs/migrations.md`, `docs/observability.md`, `docs/security.md`, `docs/testing.md`) and the `.bkit/*.md` guides (`cloud.md`, `install.md`, `providers.md`, `templates.md`, `cli.md`, `pipeline.md`, `README.md`). Nothing was left to edit.

## Drift Resolved

None needed. Checks run (repo is not shallow; the full `origin/dev..HEAD` history was read):

- Searched `docs/*.md`, `.bkit/*.md`, `.agents/*.md`, `README.md`, `DETAILS.md` and `floorplan/README.md` for the removed `preflight-linear.sh`, `validateCloudTrackerMatch` and `CLOUD_MODES`. No stale reference remains outside archived plans, `docs/graphify-out/graph.json`, the ledgers and an audit report.
- Searched for wording that pairs a cloud variant with one tracker. None found.
- `preflight-tracker.sh` is documented in `docs/architecture.md`, `.bkit/providers.md` and `.bkit/cloud.md`.
- The `codex` router job and the one-job-per-run `Select agent job` rule are documented in `docs/deployments.md`, `docs/observability.md` and `docs/security.md`.
- `docs/migrations.md` registers the `cloud-router-tracker-stale` advisory.
- `docs/testing.md` lists the cloud ctx-step, workflow-template and `preflight-sh` integration tests. It does not list every unit test file (for example `auth.test.ts`, `tracker.test.ts`, `cloud-env.test.ts`) and did not before this cycle, so I left that as is.
- `CHANGELOG.md` has no unreleased section; entries are written at release time, so I did not add one.
- `MEMORY.md` holds no 719 entries and no duplicated doc content, so no memory change was needed.

## Pending Items

Deferral scan matches for 719-cloud-variants-add, for human review:

- `719-cloud-variants-add-challenge-low-bkit-templates-github-workflows-bkit-cloud-yml-531` (LOW, low-severity): the `printf | head -1` subject extraction can fail the context step on a squash message above 64 KB.
- `719-cloud-variants-add-challenge-low-bkit-templates-github-workflows-bkit-cloud-yml-504` (LOW, low-severity): the same pipe failure on the dev arm.
- `719-cloud-variants-add-challenge-low-bkit-templates-github-workflows-bkit-cloud-yml-184` (LOW, low-severity): the `pr-head` checkout turns the run red when the feat branch has been deleted.
- `719-cloud-variants-add-challenge-low-bkit-core-hooks-preflight-tracker-sh-38` (LOW, low-severity): `GITHUB_ISSUE_ID` is not checked against `^[0-9]+$` before reaching the `curl` URL.
- `719-cloud-variants-add-challenge-low-bkit-core-hooks-preflight-tracker-sh-189` (LOW, low-severity): an unrecognised `bkit.tracker.default` fails open with exit 0.
- `719-reconcile-tracking-branch-divergence` (MEDIUM, needs-decision): the latest row is CLOSED. The next feature push replaces the stale remote branch with `--force-with-lease`.
- `397-dual-agent-same-run-double-ship-when-both-secrets-set` (HIGH, scope-declared, TRIAGED): close once the `Select agent job` step is merged.
- `719-linear-jira-router-live-read` (MEDIUM, scope-declared, TRIAGED): Linear and Jira router dispatch is proven by recorded replies only, not live.
- `719-codex-cloud-session-start-guard` (MEDIUM, hard-blocked, TRIAGED): Codex Cloud has no session-start guard until a live task proves hooks fire.
- `719-runner-tracker-mcp-fallback` (LOW, scope-declared, OPEN): runner agent jobs have no tracker MCP fallback.

## Blockers

None.
