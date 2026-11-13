# Docs Update

## Files Modified

- `docs/testing.md`
- `.bkit/core/.bkit/pipeline.md` (rendered to `.bkit/pipeline.md` by `bkit upgrade`; `.bkit/version` hash refreshed)

## Drift Resolved

- `docs/testing.md` — Sync: the `ship-invariants.test.ts` row in the test file table named the ship close's label calls as Step 14; the close is Step 12 now (the test asserts `Step 12.3 labels skip when ISSUE_ID is empty`). Reorganize, compress and cross-reference passes: no further change needed; the build had already updated the step count (12 step keys) and the pre-merge push list (Failure Remediate removed) in both places in this file.
- `.bkit/core/.bkit/pipeline.md` — Sync: the shared-subagents sentence said `bkit-debug-failure-diagnose` and `bkit-debug-failure-remediate` run inside the Ship failure path, and the Phase 5 table listed both as ship subagents ("Diagnoses a refused merge before a bounded fix attempt", "Applies the diagnosed fix before merge re-validation"). Ship no longer runs either agent, so the sentence now names the Build failure path only and the two ship rows are deleted. The pipeline map and the orchestrator-only step list already matched the 12-step ship.
- Already synced by the build and checked here with no further change: `docs/deployments.md` (Step 12 squash-capstone read, pre-merge push list without a Failure Remediate fix), `docs/setup.md` (`/bkit-ship` — 12 steps), `docs/capabilities.md` (regenerated symbol counts), `.bkit/workflows.md`, `.bkit/README.md`, `.bkit/prompts.md` (cross-phase reuse names build only), `.bkit/cli.md` (`workflows fail --next-step`).

History read: `git rev-parse --is-shallow-repository` printed `false`. The shipped files are the feature branch's diff against local `dev` (this landing goes to local `dev`, not through `origin/dev`).

## Unresolved Coverage

- `docs/data-schema.md` and `docs/noise.md`: `bkit check` reports both as still holding only the shipped starter text (advisory `project-docs-unpopulated`). Not applicable to this ship: the change touches workflow prose, the step table, the status-hole check and the `workflows fail` verb, and stores no data and adds no noise rules.
- Memories: no `MEMORY.md` / `memory/*.md` entry names ship's removed fix round or the old step numbers, so none needed a change.

## Documentation Warnings

```jsonl
{"topic":"data-schema","gap":"starter-only","recommendedPath":"docs/data-schema.md","alternativeEvidence":"None available","action":"Populate docs/data-schema.md with the repository's ledger and status-row schemas, or index .bkit/jsonl.md as its equivalent in .agents/docs.md."}
{"topic":"noise","gap":"starter-only","recommendedPath":"docs/noise.md","alternativeEvidence":"None available","action":"Populate docs/noise.md with the project's known-noise rules, or mark the topic not applicable in .agents/docs.md."}
```

## Pending Items

- `911-ship-failed-merge-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-408` — LOW: a `--next-step` value holding a backtick breaks out of its code span and posts live markdown in the failure comment (`.bkit/core/engine/commands/workflow/workflows.ts:408`).
- `911-ship-failed-merge-challenge-low-bkit-core-workflows-bkit-ship-md-345` — LOW: a cancelled, action-required or stale check in the Step 2 CI wait counts as failed, so ship names `/bkit-debug {FID}` for a run that never went red (`.bkit/core/workflows/bkit-ship.md:345`).
- `902-ship-step-11-fix-round-record` — LOW, scope-declared: recording ship Step 11's fix round taken without asking goes away with this change; remediation names #911.
- `911-ship-strategy-field-removal-via-907` — LOW, scope-declared: removing the Strategy field from the build and debug fix loops is #907's scope.

## Blockers

None
