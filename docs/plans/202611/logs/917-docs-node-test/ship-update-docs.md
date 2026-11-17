# Docs Update

## Files Modified

- `docs/testing.md`

## Drift Resolved

- `docs/testing.md` (Sync, then Compress; Reorganize and Cross-references found nothing to change): § Test first, bullet **Judged by the report, never the exit code**, now states the load-failure red the way `judgeRed` in `.bkit/core/engine/commands/workflow/tests.ts:560-566` applies it: no case carries the planned name, and the report holds no case, or only non-passing cases whose name contains the file's stem. It matches the wording this feature put into `.bkit/core/.bkit/workflows.md` (the Red row and **The report, never the exit code**). The bullet still read "no case of its own in the report", which does not cover a Node plain script that reports one failing case named after its path.
- `docs/testing.md` § Test first already carries this feature's Node command and the **Node case names** sub-bullet, and the starter `.bkit/templates/docs/testing.md` now has its own § Test first with the same bullets, so a consumer's pointer from `.bkit/workflows.md` resolves.
- `.bkit/templates.md` lists only the Vitest and jest `bkit:test:file` commands. The build decision (`build-decision-1-1.md`, option b) placed the Node command in the starter testing doc, not there, so this pass leaves it as decided.
- History read: `git rev-parse --is-shallow-repository` printed `false`; `git log --oneline --stat origin/dev..HEAD` lists 32 commits. This feature's commits change only docs, doc templates, `.bkit/instructions.md`, `.bkit/version` and ledgers; the other commits come from local `dev`, merged into the feature branch, and carry their own ship docs passes.
- Agent memories: no memory file mentions `bkit:test:file`, `node:test` or § Test first, so none needed an update.

## Unresolved Coverage

- `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/setup.md`: not applicable; the change is test-runner guidance in the testing docs and the shared workflow doc, with no topology, dependency, credential, release, logging, UI or setup change.
- `docs/data-schema.md` and `docs/noise.md`: not applicable to this change; both still hold only the starter text (`bkit check` advisory `project-docs-unpopulated`).

## Documentation Warnings

```jsonl
{"topic":"data-schema","gap":"starter-only","recommendedPath":"docs/data-schema.md","alternativeEvidence":"None available","action":"None for this ship; the change touches no data schema."}
{"topic":"noise","gap":"starter-only","recommendedPath":"docs/noise.md","alternativeEvidence":"None available","action":"None for this ship; no signal was downgraded."}
```

## Pending Items

None

## Blockers

None
