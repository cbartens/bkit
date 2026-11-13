# Docs Update

## Files Modified

- `docs/testing.md`

## Drift Resolved

- `docs/testing.md` (Sync, then Compress; Reorganize and Cross-references found nothing to change): the `commands/workflow/tasks.test.ts` inventory row now states that `tick` reads `--green` gaps only from the report's `## Gaps` section, so a task listed only under `## Updated tests` or `## Already landed` is ticked. This matches `gappedTasks` in `.bkit/core/engine/commands/workflow/tasks.ts` and the two new cases in `tasks.test.ts`.
- `.bkit/prompts.md` and `.bkit/workflows.md` already describe `Updated tests` and `Already landed` entries as notes, not gaps, so the shipped behaviour now matches them and they need no edit.
- History read: `git rev-parse --is-shallow-repository` printed `false`; `git log --oneline --stat origin/dev..HEAD` lists 20 commits, of which this feature's code change is `.bkit/core/engine/commands/workflow/tasks.ts`, its test file and `dist/commands/workflow/tasks.js`. The other commits come from local `dev`, merged into the feature branch, and carry their own ship docs passes.
- Agent memories: no memory file mentions `tasks tick` or `--green`, so none needed an update.

## Unresolved Coverage

- `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/setup.md`: not applicable; the change is one parser function inside an existing command file, with no topology, dependency, credential, release, logging, UI or setup change.
- `docs/data-schema.md` and `docs/noise.md`: not applicable to this change; both still hold only the starter text (`bkit check` advisory `project-docs-unpopulated`).

## Documentation Warnings

```jsonl
{"topic":"data-schema","gap":"starter-only","recommendedPath":"docs/data-schema.md","alternativeEvidence":"None available","action":"None for this ship; the change touches no data schema."}
{"topic":"noise","gap":"starter-only","recommendedPath":"docs/noise.md","alternativeEvidence":"None available","action":"None for this ship; no signal was downgraded."}
```

## Pending Items

- `930-build-tick-green-challenge-low-bkit-core-engine-commands-workflow-tasks-ts-110` (LOW, `low-severity`): a `--green` text report with gap lines but no `## Gaps` heading reads as zero gaps, so `tasks tick` ticks every gapped task and exits 0.
- `930-build-tick-green-challenge-low-bkit-core-engine-commands-workflow-tasks-ts-112` (LOW, `low-severity`): a failing test whose JUnit failure message holds a line starting `## ` ends the parsed `## Gaps` section early, so later gaps are dropped and their tasks are ticked.

## Blockers

None
