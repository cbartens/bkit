Verdict: CONCERNS
Failures: 1
Redesign: false

<!-- verdict:end -->

# Plan Review

Lens: Regression risk — touched surfaces, backwards compatibility, design-coverage.

## Surface-Area Map

Reviewed the current run-2 plan against the amended design in plan-input-2.md. The approved lock, verified undo, inherited content generation and full-content conflict-preservation contracts govern this review. Three reviews run in parallel; no sibling review output was consulted.

Paths below are relative to the repository. Engine paths are under `.bkit/core/engine/`. HIGH marks shared utilities, data migrations, public command/schema contracts or writer authorization surfaces; these flags are OPTIONAL unless a specific CRITICAL finding below applies.

<!-- prettier-ignore -->
| Task | Direct surface and contracts | Consumers / regression coverage |
| --- | --- | --- |
| 1 | `ledgers/migrate.test.ts`; existing Git union/stub behavior | Upgrade, close squash and old branches. Three actual Git merge characterizations; no invented new behavior. |
| 2 | `commands/workflow/brain.integration.test.ts`; preserved stats/roadmap output and task-file token baselines | Stats, roadmap and later context measurements. Characterization exception correctly preserves pre-change ground truth. |
| 3 | HIGH: `ledgers/brain.ts` constants and `telemetry.ts` identity, defaults, exhaustive kind/writer tables; JSONL contract | All ledger readers/writers and registry consumers. Interim assumption/summary registration keeps one ledger per kind; telemetry tests own the change. |
| 4 | HIGH: telemetry validation, transitions, links and writer rules | Existing append API plus future brain wrapper. Atomic refusal and transition cases stay with the schema task. |
| 5 | HIGH: `readBrain`, normalization, source diagnostics, full-content equivalence and conflicts | Context/search, stats, graph, update and migration. Brain helper tests cover mixed brain/stub input and divergent versions. |
| 6 | Brain link indexes, reverse dependencies and findings | Check, terminal-write notices and fade selection. Graph tests cover dangling/dead/cyclic/expired/successor cases. |
| 7 | HIGH: telemetry/migrate/branches registries; version-file data classification | Upgrade hashing, conflict union and close squash. Real Git tests cover resurrected old files and schema-data exclusions. |
| 8 | HIGH: brain lock/evidence/publication primitives and deterministic merge in `migrate.ts` | Every later writer and install/update drain. Merge tests cover mapping, exact content, collisions and interrupted drain; introducing-task lock coverage is missing (R2-1). |
| 9 | HIGH: `install/modules/core.ts`, migration entry point, check advisory, attributes and migration docs | Install, upgrade, check and populated old consumers. Actual consumer tests cover dry runs, source retention, publication recovery and branch/worktree decisions. |
| 10 | HIGH: sibling `commands/workflow/brain.ts`, ledgers shared handlers, registry and compactor; writer cutover | All CLI invocations plus existing bookkeeping callers. Real file/CLI tests cover append/check/list/compact/refusal, lock serialization and built startup. |
| 11 | HIGH: stats/analysis/workflows/challenge/decisions/context/steps/step-table/CLI/harvest readers and writers | Workflow lifecycle, deferral statistics, reason history, roadmap and harvest privacy. Full output and kind-filter parity tests accompany cutover. |
| 12 | Canonical prompts/workflows/templates and ledger-integrity audit | Generated hosts and direct prompt readers. Path/read-door mechanism guard covers shipped source, not historical artifacts. |
| 13 | Pure path normalization/ranking and pathless cap in brain helpers | File context and always-loaded summary. Helper tests own path/cap behavior. |
| 14 | HIGH: brain context handler, existing context clamp and common-checkout recall writes | Five host dispatchers and linked worktrees. Actual CLI tests verify budgets, dropped rows, recall and built import safety. |
| 15 | Shared gotcha clauses, workflow dispatch and rendered prompt capabilities | No-shell agents on all five hosts. Mechanism checks require injected context and remove unavailable command instructions. |
| 16 | Preserved Task 2 measurements and actual context output | Three recorded task file sets. New behavior assertion compares against unchanged old-layout figures rather than regenerating its baseline. |
| 17 | Brain search wrapper around existing `ledgerScan`, recall output | Related-context workflows and direct CLI users. Real CLI tests cover fold/kind/current/top-40 semantics and returned-key recalls. |
| 18 | Plan/ship search calls, related-artifact paths and clamp contracts | Workflow resume and review dispatch. Guard checks command kinds and required artifact wiring. |
| 19 | HIGH: telemetry fold/proposal rank, compaction evidence, suggestion IDs and locked stale/applied skips | Append/update, branch merges, undo and conflict resolution. Permutation and compaction cases include base10/P1/P2/C50 and retained fingerprints. |
| 20 | HIGH: settings plus recall/fade/rejection helpers | Attended/headless update and recall writers. Tests cover boolean default, date/link boundaries and rename/rejection retention. |
| 21 | HIGH: update cleanup and actual common-lock publication, source drains and packet paths | Worktrees, migration, recall and subsequent inference. Real filesystem tests cover cleanup races and packet ground truth. |
| 22 | HIGH: apply/approve/reject and dedicated verified undo | Owner chat, headless runs, retained evidence and rejection ledger. Real CLI tests cover stale/forged refusal, valid inverse kind restore, creation withdrawal and exact conflict sets. |
| 23 | Update diagnostics, seven counters and report freshness/provenance | Stats, direct CLI and reports. Integration cases check file effects and stdout/stderr contracts. |
| 24 | Unified inference prompt, procedure, model/tool pins and retirement of four updater prompts | Five host renderers and issue-less update dispatch. Source/render tests cover inference cases and supersession. |
| 25 | HIGH: optional cloud template and adopted workflow, provider dispatch and push retry | Existing CI secrets/provider selection and scheduled consumers. Local contract tests plus explicit disposable-repository @live run assert actual provider boot, run URL and cleanup/report-only commit. |
| 26 | Optional qmd exporter/config/smoke template | Real brain CLI, derived documents and optional external model. Integration checks export/prune/path containment/ignore state; @live verifies the pinned actual model returns the seeded identity. |
| 27 | Composed five-host fresh/old consumer verification | Actual install/upgrade/check and all eight verbs. Explicit characterization exception avoids an impossible late mandatory red. |
| 28 | Documentation, generated mirrors and committed distribution | npm consumers, host command/tool renderers and source drift gates. Existing behavior tests plus Static/Unit/Integration and built-consumer evidence; no fabricated new behavior test. |

There are no SQL tables, RLS policies, service API endpoints, event topics or queue schemas in this feature. Its compatibility boundaries are local JSONL envelopes/identities, command nouns/exits, generated agent instructions, Git merge attributes and consumer upgrade behavior.

The current design sections have corresponding tasks: schema/graph (3–6), registries/migration (7–11), scoped context and search (12–18), proposal/update/undo/reporting (19–24), schedule/qmd (25–26), and host/package verification (27–28). Declared non-goals remain outside this plan.

Knowledge cross-check: the winning active `workflow-ledgers-importing-tests-closes-a-steps-cycle` row is acknowledged by sibling dispatch and built CLI checks. `kn-9-bkit-version-migration-reads-must-use-readbkitversion-pin`, the ledger bookkeeping shell portability fix, and projection/duplicate-collapse guidance are not contradicted by the planned changes. Related deferrals preserve the later stub-retirement release and keep feature/friction/stats/chat history outside scope. The supplied related-failures artifact is explicitly truncated; omitted historical content is not evidence of absence.

## CRITICAL

### R2-1 — Shared lock behavior is introduced before its regression tests (plan edit)

**Surface:** Task 8, group 2, `ledgers/brain.ts` shared write lock and durable-copy primitives. The matrix assigns Task 8 only merge mapping/drain tests (`plan-v1-draft.md:81`); Task 8 explicitly adds the common lock at line 494, but its DONE WHEN and five TEST FIRST cases at lines 498–504 cover only line accounting, mapping, collisions, equivalent-content drains and restart idempotence. The first ownership/serialization test is Task 10, group 3 (line 546).

**Regression vector:** group 2 can accept a lock that evicts a live/unknown owner, lets an expired token publish/release another owner's lock, or writes after bounded acquisition failure. Those behaviors are central to the newly approved protection against lost appends. Mapping a prepared input twice does not exercise ownership or the real filesystem arbitration boundary. Deferring the test to the next task group violates the contract that each logic-changing task owns its tests, and leaves the shared primitive unverified at its introducing boundary.

**Required plan edit:** give the task that implements the lock its own Derived Test Matrix row and non-mock filesystem/process tests, plus a DONE WHEN that asserts bounded contention writes nothing; live/unknown owners are not displaced; nested calls reuse ownership; and stale/lost tokens cannot publish or release a replacement owner. Keep the later wired append/compact/migration race case in Task 10. Alternatively move implementation of the lock primitives to the task/group that owns those tests, leaving Task 8 strictly pure mapping. Respect the group/task test caps when reallocating. No design change is needed.

## OPTIONAL

1. **Unify stale command-location instructions.** The approved architecture and Tasks 10/14/17 correctly choose a sibling command module, but Alternatives at line 146 and the Reuse Inventory at line 232 still say to export the brain noun from the existing ledgers module; Task 10's registry edit repeats “existing module” at line 534. Name the sibling path consistently. This is a high-risk shared import graph: `context.ts:66–67` imports steps/tests, `steps.ts:48–54` imports ledgers, and `steps.ts:1427` reads the ledgers constant at module initialization. The active knowledge row at `docs/knowledge.jsonl:113` records the resulting built-CLI startup failure. Classified optional because the newer explicit contract, sibling CREATE and built-startup test already prohibit the unsafe implementation.
2. **Bring older summaries into line with the approved contracts.** The recall assumption at line 137 still accepts the former open/rename race, the Supersession Inventory says all retained files are empty stubs, and the CLI documentation row says seven verbs. The current contracts instead open recall descriptors only after locking, preserve full sources when incompatible-writer quiescence is unproven, and expose eight verbs including undo. Update these summaries to avoid contradicting the detailed accepted behavior.
3. **High-risk surfaces explicitly flagged:** schema/identity/writer validation (3–5), data/merge registries and migration (7–11), recall and compaction/proposal provenance (14, 19–22), CI credential/provider dispatch (25), and the optional external model (26). Beyond R2-1, their planned regression/boundary coverage is present; retain those assertions during implementation.

## OUT OF SCOPE

None. No additional feature, index, database, workflow phase or legacy-retirement work is requested by this review.
