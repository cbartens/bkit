# Docs Update

## Files Modified

- `docs/deployments.md`
- `docs/testing.md`

## Drift Resolved

- `docs/deployments.md` § Pre-push checklist, **Min push** paragraph (sync, compress, cross-references):
  - The list of what bkit's own `bkit:gate:min` runs now names `templates.test.ts` and `template-no-userpath.test.ts` beside ledger-integrity, with the reason (both read audit-template text below `<!-- bkit:end -->`), matching `package.json` `bkit:gate:min`.
  - The floor and the audit-template exception stay in their one home, `.bkit/templates.md` § Git hooks — Husky, which the build already updated; the paragraph keeps its pointer there.
- `docs/testing.md` test registry (sync):
  - `commands/ci/ci.test.ts` row: added the `bkit ci min-push` cases (floor with `docs/audits/**`, every `--ref` checked, the audit-template project-section exception and each refusal case, `--update` logging).
  - `.bkit/core/engine/audits/templates/template-no-userpath.test.ts` row: now names the audit templates it checks and that bkit's own `bkit:gate:min` runs it.
- Reorganize: no duplicates or misplaced content found in either section.
- Shallow history: `git rev-parse --is-shallow-repository` printed `false`; `git log origin/dev..HEAD` read in full (38 commits, of which one non-915 code commit, `3415f750b`, arrived through the local `dev` merge).
- Memory: `MEMORY.md` holds no min-push content, so no memory change.

## Unresolved Coverage

<!-- prettier-ignore -->
| Topic | State | Evidence |
| --- | --- | --- |
| `docs/data-schema.md` | Starter-only; not applicable to this ship | `bkit check` advisory `project-docs-unpopulated`; the shipped files touch no data schema. |
| `docs/noise.md` | Starter-only; not applicable to this ship | `bkit check` advisory `project-docs-unpopulated`; this ship downgrades no signal. |
| `docs/testing.md` | Undercovered: no rule for a unit test that times out under machine load | Build summary Documentation Warnings (failure-diagnose); outside this feature's scope, reported, not edited. |

Covered and checked: `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/setup.md`, `docs/observability.md`, `docs/design.md` (not touched by the shipped files); `docs/deployments.md`, `docs/testing.md` (edited above).

## Documentation Warnings

```jsonl
{"topic":"data-schema","gap":"starter-only","recommendedPath":"docs/data-schema.md","alternativeEvidence":"None available","action":"Populate from repository facts in a separate change; this ship touches no data schema."}
{"topic":"noise","gap":"starter-only","recommendedPath":"docs/noise.md","alternativeEvidence":"docs/failures.jsonl rows for load-sensitive tests","action":"Leave as is until a signal is downgraded."}
{"topic":"testing","gap":"no rule for unit tests that time out under machine load","recommendedPath":"docs/testing.md","alternativeEvidence":"vitest.timeout-budget.ts header comment; knowledge rows on load-induced timeouts","action":"Add a short rule in a separate change: re-run alone, then a suite-level budget with owner approval."}
```

## Pending Items

- `915-min-push-ignores-challenge-low-bkit-core-engine-commands-ci-ci-ts-651` (LOW, correctness, `low-severity`): `minPushOutside` decodes both audit-template blobs as UTF-8, so two different invalid bytes inside the managed block both become U+FFFD and compare equal; the push then takes the light gate. Done when the comparison is byte-preserving.

## Blockers

None
