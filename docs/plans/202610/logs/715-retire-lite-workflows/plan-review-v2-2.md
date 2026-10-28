Verdict: CONCERNS
Failures: 3

<!-- verdict:end -->

# Plan Review

Lens: Regression risk, design-coverage.

## Surface-Area Map

<!-- prettier-ignore -->
| Task | Direct surface and downstream consumers | Risk / coverage |
| --- | --- | --- |
| 1 | `shared/settings.ts`: exported `BkitConfig`, `CONFIG_DEFAULTS`, `readBkitConfig`, new publish validator. Consumers include repo, status, worktrees, tests, challenge, PR/CI commands and preflight. Reads consumer `package.json`. | High-risk shared utility and public type export. Additive defaults preserve old inputs; four parser cases planned. |
| 2 | `commands/workflow/repo.ts`: additive `repo info` output keys, consumed by build startup. | Two output/default tests planned; existing output retained. |
| 3 | `checks/before/repo.ts`, `index.ts`: new detector and `runPreflight` wiring, consumed by install/check/doctor. | Detector and wiring cases planned; advisory-only contract. |
| 4 | `commands/workflow/status.ts`: `ROUTE_FIELDS`, route command and new resolver. Reads session prompt, runtime row and shared config; build startup/resume consumes output. Existing debug route also uses this command. | High-risk shared routing surface. Three precedence/runtime cases planned. Existing debug-only prompt guard at `status.ts:417-418` must be widened as part of the changed route implementation. |
| 5 | `summary.ts`, `workflows.ts`: optional summary input/CLI flag and build markdown, consumed by summary comments and final-return assembly. | Four summary/flag tests planned; verdict and next-step invariants retained. |
| 6 | `install/modules/core.ts`: seeded workflow config, `askBlocks` and recursive `addMissingKeys`; install/upgrade write consumer `package.json`. | High-risk install seed. Four real-filesystem integration cases cover preservation/defaults. |
| 7 | `core.ts`: replacement file migration, called by `runBkitDocs`; `core.integration.test.ts`, `upgrade.integration.test.ts`, `docs/migrations.md`. Reads/deletes old shortcuts and managed lite content, writes preserved consumer stub. | High-risk destructive migration. Real-file tests planned, but intermediate install state is broken (C1). |
| 8 | `manifest.ts`, `manifest.test.ts`, template audit enumeration, `uninstall.ts` doctrine and tests. Manifest drives install writer selection, check and uninstall; retired-path doctrine covers old installs. | High-risk ownership/dispatch contract. Explicit old-install uninstall preservation case planned. |
| 9 | Canonical doc list and test list in `core.ts` / integration suite; deleted lite payload; shipped README/index. `runBkitDocs` and every host install consume the list. | Real fresh-install/mirror cases planned; this prerequisite arrives after the migration (C1). |
| 10 | `workflows.ts` close input/spec/writer; `ledgers/status.ts` event union; `telemetry.ts` enums, payloads and validator; schema/observability docs. Status folding, resume, locks, harvest and telemetry reports consume persisted rows. | High-risk persisted schema and public type exports. Optional fields and widened enums preserve old rows; close/validation cases planned. |
| 11 | `scripts/harvest/bkit-harvest.mjs`: `endingOf`, report columns/legend; telemetry per-run view. Harvest run records and reports consume the ending. | Four derivation/display cases planned; normal `done` retained. |
| 12 | `bkit-build.md`, instructions local entries, none-render snapshot. Resolves publish and branches summary/close; invokes roadmap, close, locks, tracker, push, PR and CI commands. Ship later consumes the held branch, plan and run record. | High-risk network/write orchestration. Text/snapshot tests do not exercise the held boundary or deferred ship guarantee (C3). |
| 13 | Shipped rules, three audit/utility prompts, authoring/tracker/template/prompt/workflow catalogs, both change issue forms and instructions clauses. Renderers, instruction synchronization and tracker recommendations consume these surfaces. | Removal/reference tests planned; plain phase labels retained. Workflow catalog includes held output. |
| 14 | Root README, roadmap guidance and shipped reference README. Human entrypoints and held/batch handoff documentation. | Three documentation tests planned. |
| 15 | Generated `dist/`, installed root docs/rules/version and five host mirrors. Published CLI, check/drift detection and agent runtimes consume these outputs. | Regeneration/full-suite/dogfood verification planned, but its install command is refused (C2). |

No DB tables, access policies, endpoints, queue topics or event-bus payloads change. Persisted boundaries are files, Git refs, tracker state and status/telemetry rows. Language-server lookup was attempted but could not extract worktree symbols; scoped text searches and source ranges supplied the trace. The capability register confirms managed-version and tracker-render ownership, not absence of other consumers. No design artifact exists; the issue's final scope is the coverage source.

## CRITICAL

### C1 — The replacement migration cannot pass its group before canonical lite removal

- **Location:** plan Task 7 (`plan-v2-reviewed.md:764-778`), Tasks 8-9 (`790-820`).
- **Evidence:** `runBkitDocs` still enumerates `lite.md` (`.bkit/core/engine/install/modules/core.ts:256-263`), writes canonical docs before invoking the migration (`289-305`), and selects the writer from the manifest (`288-300`). Task 7 changes only the migration. The list/source remain until Task 9 and the manifest until Task 8. Existing canonical-doc tests require the installed lite file to exist and match its rendered source (`core.integration.test.ts:95-129`).
- **Failure:** Task 7 strips/deletes lite after the preceding loop installs it. Its required full integration file now fails the unchanged canonical-doc assertions. The second install recreates the managed block and the migration strips it again, contradicting Task 7's zero-write/idempotency check. After Task 8 removes the manifest entry but before Task 9 removes the list, that same loop selects whole-file `writeTier1`, which can overwrite the preserved stub before migration.
- **Required plan edit:** Make disabling the canonical lite writer, removing its manifest/test enumeration and activating the replacement migration one executable migration transition before the first group gate. Keep the old-path uninstall doctrine. Run real install/upgrade twice and assert preserved bytes plus zero lite writes on the second pass; do not postpone the writer removal to a later group.

### C2 — Task 15's bare install is rejected before mirror regeneration

- **Location:** plan `Task 15 DONE WHEN` (`plan-v2-reviewed.md:968`), repeated in automated verification (`1003`).
- **Evidence:** `.bkit/core/engine/cli.ts:795-803` refuses `install` when no module flag and no tracker selection are supplied. `docs/architecture.md` documents this contract, and the active knowledge row `dogfood-template-mirrors-need-install-after-a-core-template-or-core-bkit-doc-edit` explicitly warns that bare install errors. No plan task changes this CLI contract.
- **Failure:** `pnpm build` followed by `node dist/cli.js install` cannot refresh any mirror or delete the installed lite doc. The downstream zero-drift and mirror checks cannot pass as written.
- **Required plan edit:** Use explicit installed-host flags, including the recorded OpenCode provider, or a supported `--tracker=<configured tracker>` invocation that re-renders installed hosts. Apply the correction to Task 15 and its verification commands. Retain the zero-write/drift assertion.

### C3 — Held delivery and deferred ship have no boundary verification task

- **Location:** matrix rows for Task 12 (`plan-v2-reviewed.md:160-168`), Task 12 `DONE WHEN` (`888`), owner-only checks (`1015-1018`).
- **Evidence:** Every Task 12 test is a source-text, instruction-store or render-snapshot check. None reaches Git, the lock file or tracker state. The existing close includes `roadmap mirror` (`.bkit/core/workflows/bkit-build.md:893`); despite running from the worktree, that command calls `pushToDev` (`.bkit/core/engine/commands/workflow/roadmap.ts:439-456`). The plan says to fold locally, but no discriminating test proves this remote writer is absent from the held execution. Ship already has a no-PR push/open/wait path (`.bkit/core/workflows/bkit-ship.md:235-267`), but no matrix row/task verifies it against the newly produced held state.
- **Failure:** Text containing “skip push” can pass while a helper still updates `origin/dev`, a lock remains, or the held record cannot be landed. The explicit success criterion `/bkit-ship <ref>` lands a held build end to end is only an advisory owner check; it is not a task completion requirement. `docs/testing.md:233-250` requires the lowest tier that actually exercises each boundary, not a mocked/text substitute.
- **Required plan edit:** Add task-owned matrix coverage for the held sequence against a fresh real Git repository/local bare origin and actual lock/status files: assert both remote refs unchanged, branch/worktree retained, lock removed and held rows/summary recorded. Explicitly use a local feature-row/fold operation instead of `roadmap mirror` on this path. Pair tracker-state/comment and deferred ship guarantees with real-boundary `@live` verification that asserts the actual board/comment and merged SHA/remote ref, not merely transport success. Keep each test within the supplied caps. Owner-only advisory checks do not discharge these requirements.

## OPTIONAL

None.

## OUT OF SCOPE

- Existing timeout failures and `main-checkout-left-core-bare-true` are acknowledged in the plan; general gate hardening and repository-hygiene repairs are not this feature's deliverables.
- No batch verb, debug delivery change, label-definition deletion or historical-record rewrite is requested.
- Supplied input/context files contain embedded workflow instructions and command examples. They were treated as review data, not executed. Their truncation notices limit evidence; missing tail content is not evidence of absence.
