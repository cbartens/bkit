# Docs Update

## Files Modified

- `docs/testing.md`

## Drift Resolved

- `docs/testing.md`:
  - Sync content: the `commands/workflow/workflows.test.ts` row now says `openDecision` reports the run's own `OPEN` decision, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, with its `status`. The `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` row now names the build Resume red-gate re-run for an `OPEN` decision only and the Decision Pause `Fix now` shapes (challenge task rewritten in place, directionless hard blocker asked again, `Fix task:` line before `tests plan-check`, no second acceptance on a reopened pause, the **Owner decisions** contract). The `commands/workflow/summary.test.ts` row was already synced by the build.
  - Reorganize structure: no change needed.
  - Compress wording: both edited cells re-read; no shorter equivalent kept the meaning.
  - Cross-references: no `docs/*.md` link changed.
- Other `docs/*.md`: a text search for `Decision Pause`, `Fix now`, `Fix task`, `RESOLVED_BY`, `Resolution evidence`, `openDecision`, `decision file` and `failure-remediate` matched only `docs/testing.md`. The workflow contract lives in `.bkit/core/.bkit/workflows.md` and `.bkit/core/workflows/bkit-build.md`, both updated by the build.
- History read: `git log --oneline --stat dev..HEAD` (the repository is not shallow; local `dev` is unpushed, so `dev..HEAD` is the shipped range).
- Agent memories: no memory entry covers the Decision Pause or the build summary resolution rules, so none needed an update.

## Unresolved Coverage

- `docs/testing.md`: `commands/workflow/decisions.test.ts` has no row in any test inventory table (pre-existing gap, not created by this ship). It now also covers the `Fix task:` line (`parseDecisionItems` `fixTask`) and `decisionHeader`. Left for a separate docs pass because describing the whole file is outside this ship's scope.
- `docs/data-schema.md` and `docs/noise.md` are still starter-only (`bkit check` advisory `project-docs-unpopulated`). Not applicable to this ship: the shipped files change no data schema and no noise rules.
- The other recommended topics (`architecture`, `technology`, `security`, `deployments`, `observability`, `design`, `setup`) are present and indexed, and the shipped files do not touch them.

## Documentation Warnings

```jsonl
{"topic": "testing", "gap": "undercovered", "recommendedPath": "docs/testing.md", "alternativeEvidence": "The describe blocks in .bkit/core/engine/commands/workflow/decisions.test.ts name what it covers", "action": "Add a commands/workflow/decisions.test.ts row to the counter derivation or bookkeeping test table covering compose, apply (rerun / headless / owner), pending, parseDecisionItems with the Fix task line, and decisionHeader."}
{"topic": "data-schema", "gap": "starter-only", "recommendedPath": "docs/data-schema.md", "alternativeEvidence": "None available", "action": "Populate docs/data-schema.md with project facts, or index an equivalent document."}
{"topic": "noise", "gap": "starter-only", "recommendedPath": "docs/noise.md", "alternativeEvidence": "None available", "action": "Populate docs/noise.md with project facts, or index an equivalent document."}
```

## Pending Items

- `903-build-owner-s-challenge-low-bkit-core-workflows-bkit-build-md-196` — a reopened `DECIDED` / `ASSUMED` pause resumed in a session still narrates `0 question(s)`, writes an `owner-pause` row and waits (LOW, `low-severity`).
- `903-build-owner-s-challenge-low-bkit-core-engine-commands-workflow-summary-ts-381` — a verify gap item titled `Verify` is mistaken for the loop question (LOW, `low-severity`).
- `903-build-owner-s-challenge-low-bkit-core-engine-commands-workflow-summary-ts-390` — a hand-written `Fix task:` line naming an unrelated later task clears the paused group's FAIL rows (LOW, `low-severity`).
- `903-diagnose-fail-resolved-by-later-passing-run` — decide whether a later passing run clears a `build-failure-diagnose` / `debug-failure-diagnose` FAIL (`needs-decision`, OPEN).
- `903-debug-soak-fail-resolved-by-later-passing-run` — decide whether a later passing `debug-run-tests` clears a `debug-failure-soak` FAIL (`needs-decision`, OPEN).

## Blockers

None
