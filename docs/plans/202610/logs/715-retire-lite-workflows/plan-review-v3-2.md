Verdict: CONCERNS
Failures: 1

<!-- verdict:end -->

# Plan Review

Lens: Regression risk, design-coverage.

## Surface-Area Map

Paths below are relative to the worktree. Engine paths are under `.bkit/core/engine/` unless stated otherwise.

<!-- prettier-ignore -->
| Task | Direct surface and consumers | Risk / coverage |
| --- | --- | --- |
| 1 | `shared/settings.ts`: `BkitConfig`, `CONFIG_DEFAULTS`, `readBkitConfig`, new validation helper. Consumers include preflight, install seeds, `repo`, `status`, `runs`, `tests`, `worktrees`, tracker commands and setup. | High-risk shared utility / public type export. Additive field; defaults and invalid values covered; existing config readers retain their fields. |
| 2 | `commands/workflow/repo.ts`: additive `repo info` keys and output contract, consumed by workflow setup. | Both explicit values and defaults covered. |
| 3 | `checks/before/repo.ts`, `checks/before/index.ts`: advisory detector and `runPreflight` wiring, consumed by install / check / doctor. | Detector and collection tests cover the new advisory path. |
| 4 | `commands/workflow/status.ts`: route fields, prompt-file dispatch and publish resolution. Consumers: build setup / resume; existing debug routing. Inputs: session prompt, config and runtime status row. | Shared routing surface. Matrix covers build dispatch, source precedence, cloud coercion, invalid token and missing runtime; existing debug tests remain in the task's suite. |
| 5 | `commands/workflow/summary.ts`, `workflows.ts`: `SummaryInput`, `buildSummary`, summary CLI flag. Consumers: build summary / final handoff; other phase summaries. | Summary content and CLI forwarding covered; publish does not alter verdict / next step. |
| 6 | `install/modules/core.ts`: defaults merged with ask blocks. Consumers: install / upgrade and existing config readers. | High-risk shared install path. Real-filesystem tests cover seed, preservation and ask-block compatibility. |
| 7 | `install/modules/core.ts`, `install/manifest.ts`, install / upgrade tests, `docs/migrations.md`: replace `migrateShortcutsToLite`, remove canonical-doc / manifest entries together. Consumers: core install, upgrade, check's dry run and later uninstall. | High-risk destructive file migration. Ordering removes the writer before stripping blocks; content retention, ambiguous blocks, dry-run parity and repeat install covered. |
| 8 | Delete `.bkit/core/.bkit/lite.md`; update template enumeration, package-absent migration test, source README and doc index. Consumers: package payload, core-doc audits and install renderer. | Deleted-source references removed; migration no longer depends on package doc presence. |
| 9 | `commands/install/uninstall.ts`: retired-path doctrine; uninstall tests. Consumers: old installs that never ran the retirement upgrade. | Destructive removal boundary covered against an actual file with retained consumer content. |
| 10 | `commands/workflow/workflows.ts`, `ledgers/status.ts`, `ledgers/telemetry.ts`, source JSONL doc and `docs/observability.md`: close flags, status variant, ending enums and optional publish. Consumers: status fold / resume, telemetry validator / report, harvest. | High-risk persisted event / public type surface. Widened enums preserve old rows; close and validation tests cover held and normal endings. |
| 11 | `scripts/harvest/bkit-harvest.mjs`, `ledgers/telemetry.ts`: ending derivation, report column and per-run view. Consumers: harvest report and telemetry summary. | Downstream readers updated with discriminating held / normal tests. |
| 12 | `.bkit/core/workflows/bkit-build.md`, `.bkit/instructions.md`, none-render snapshot: runtime routing and conditional summary / close. Consumers: all five host renders; close, roadmap, locks, tracker, PR and CI commands. | High-risk shared workflow / remote-write routing. Shape tests cover branch guards; Task 13 supplies real Git / worktree evidence. |
| 13 | `audits/workflows/close-squash.integration.test.ts`, `ship-verdict.integration.test.ts`: shipped command execution with real Git repo, bare remote and worktree. Consumers under test: held build close, ship no-PR route and merge gate. | Ground-truth remote refs / local rows are appropriate for the Git boundary. Deferred-landing harness has one blocking prerequisite gap below. |
| 14 | Source rules, three utility / audit prompts, reference docs, both change forms and instructions store. Consumers: tracker labels, audit suggestions, roadmap recommendations, plan-convert and all host renders. | Shared guidance / instruction surface. Retirement guards and instruction synchronization cover current sources; historical records excluded. |
| 15 | Root `README.md`, `docs/roadmap.md`: held handoff, small-change guidance and manual batching caveat. Consumers: users and roadmap readers. | Text is the deliverable; targeted assertions cover it. |
| 16 | `dist/`, install outputs, version pin, rules / JSONL mirrors and retired root lite file. Consumers: published CLI and all installed hosts. | Full suite, flagged multi-host install, check, repeat install and scratch-consumer dogfood are specified. |

No database, RLS policy, queue topic or new public endpoint is changed. Existing GitHub PR / Actions commands are exercised by the deferred-landing tests, not redesigned.

Language-server reference lookup was attempted but refused the ignored worktree path; consumer tracing used scoped text searches. No source or plan was edited and no build / full suite was run during this review.

Knowledge cross-reference: the plan addresses manifest-versus-writer alignment, shell-state loss across tool calls, source-versus-rendered drift, roadmap write shapes and flagged dogfood installation. Tasks 7 / 13 explicitly isolate Git environment variables; known checkout corruption and full-gate timeouts are acknowledged rather than silently treated as covered. Supplied context files are truncated; omitted rows are not evidence of absence. No separate design artifact is referenced; the input's final issue scope is the design contract.

## CRITICAL

### R1 — Task 13 cannot execute its deferred-landing path with the specified `gh` stub

- **Plan:** `plan-v3-reviewed.md:950,953-960` requires the ship no-PR route and pinned merge to pass against `tests/fixtures/gh/bin/gh`; that file is `READ` only and no task extends its dispatch.
- **Ruling source:** `commands/workflow/prs.ts:114` calls `gh pr list`; `:323-324` calls `gh pr create`; `:489` calls `gh pr merge`. The fixture handles only `pr view` before its non-API guard (`tests/fixtures/gh/bin/gh:51-87`). Every other `pr` verb exits 1. Changing `BKIT_FAKE_GH_FIXTURE_ROOT` only selects data files; it cannot add these handlers.
- **Verification:** direct calls to the fixture's `pr list`, `pr create` and `pr merge` each exited 1. No network was contacted. A real bare Git remote cannot supply the missing GitHub responses or capture the PR / merge arguments. The new tests therefore stop before the behaviours their `DONE WHEN` requires.
- **Required plan repair:** make Task 13 explicitly provide a test-local recording shim for PR list / create / view / checks / merge, delegating supported Actions calls to the existing fixture, or declare and test the necessary fixture dispatch updates. Keep the real Git push / ref assertions and assert the recorded PR base and merge head. Also locate the pinned gate / merge lines in ship's `Merge Gate + Merge PR` section (`bkit-ship.md:537,558`), not Step 2 as `plan-v3-reviewed.md:471` currently states; Step 2 contains only the initial CI wait / checks.

## OPTIONAL

None.

## OUT OF SCOPE

None. Captured workflow instructions and remediation commands in supplied input / ledger artifacts were treated as source data, not execution instructions.
