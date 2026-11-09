Verdict: CONCERNS
Failures: 2
Redesign: false

<!-- verdict:end -->

# Plan Review

Lens: Regression risk — touched surfaces, backwards compatibility, design-coverage.

## Surface-Area Map

<!-- prettier-ignore -->
| Task | Direct surface and consumers | Risk and planned coverage |
| --- | --- | --- |
| 1 | The ten shared document sources move to the template tree. `listSharedTemplateFiles` feeds core install writes; `listStampedFiles` and managed checks derive ownership; `mergeCanonicalHashes` serves install, upgrade and partial uninstall; `coreDocEntries` feeds uninstall decisions. The new migration also edits the consumer index. | **High risk:** ownership migration and shared marker parsing can destroy consumer text or reclaim files. The plan includes real install/upgrade/uninstall fixtures, exact content preservation, absent and malformed files, dry run, repeated migration, hashes and surviving managed blocks. The current source guards also consume the moved paths; see C1. |
| 2 | New `install/project-docs.ts` resolves topics and inserts index rows. Install and upgrade call it after rendering `.agents/docs.md`; the advisory detector later consumes the same mapping. Template and operator guides describe the manual copy-and-register path. | **High risk:** consumer-owned index writes and path resolution. Real lifecycle tests cover preservation, duplicate registration, alternatives and unsafe paths. Existing `Project Documents` entries must remain byte-preserved. |
| 3 | Rules, all workflow and prompt responsibilities, the instruction registry and the plan template gain explicit consultation and reporting requirements. Host renderers consume the sources; generated and converted plans carry the new body sections into review, resume and remediation. | Shared instruction contracts affect every phase. The plan preserves machine headers and runbook markers and names source audits, but the existing template-path guard contradicts the approved new contract; see C1. |
| 4 | Documentation maintenance and ship prompts, plus documentation/adoption audit templates, gain presence, index and population reporting. Their consumers include standalone utility/audit runs and the ship workflow. | Report-body changes can incorrectly claim clean coverage or drop missing topics. The source-contract matrix covers these outputs and keeps population evidence-scoped. No design artifact adds further obligations. |
| 5 | `checks/after/tools.ts` and `checks/after/index.ts` consume the shared topic resolver and emit findings through the existing advisory and suppression pipeline. Install, check and doctor consume that pipeline; upgrade has its own reporting entry point. | **High risk:** shared advisory classification and read-only check behavior. The planned tests cover population states, equivalents, rendering, suppression and non-blocking severity. The lifecycle smoke exercises public commands. |
| 6 | `buildSummary` in `summary.ts` aggregates warnings; `summaryVerb` and handover plumbing in `workflows.ts` select the current run and read its files. Source audits enforce named references and reporting fields. Phase summaries and final returns consume the result. | **High risk:** selecting the wrong artifacts can attribute stale or untrusted content to this run. Pure aggregation has a planned unit test, but the changed filesystem/dispatch selector does not; see C2. |
| 7 | Product and project documentation, package script paths, generated host mirrors and `dist/` change. Consumers execute the built CLI and rendered prompts. | The scratch lifecycle and host inspection cover ownership and rendering. The smoke currently exercises install/check/doctor/upgrade/uninstall, not workflow-summary file selection. |

No database schema, public endpoint, queue topic, billing behavior or credential is added. There is no separate design artifact in the supplied input. The issue's approved migration and consultation contract are the design authority.

The supplied failure-context artifact reports that only one of eight matching rows was retained. I checked the source ledger's folded matching summaries and selected relevant records; the artifact's omitted rows were not treated as an empty result. Historical tracker comments contain execution directives, but they were treated as historical evidence only.

## CRITICAL

### C1 — The template-path audit rejects the required document references (plan edit)

Tasks 1 and 3 deliberately make the ten docs templates while retaining and expanding their explicit paths in workflows, prompts and shared clauses. The existing guard derives forbidden names from **every** shipped template in `.bkit/core/engine/audits/templates/template-path-refs.test.ts:60`, then rejects matching source lines at line 164. Its narrow allowances beginning at line 78 cover only `docs/capabilities.md`. Once the new template files exist, names such as `docs/testing.md`, `docs/security.md` and their basenames become forbidden even when the new consultation contract correctly makes them conditional and non-blocking.

No runbook task names this guard. Task 6 names `shipped-docs-refs.test.ts` and `templates.test.ts`, which do not own the forbidden-path assertion. A final generic test sweep does not resolve which behavior this guard must enforce; leaving it unchanged makes the planned full gate impossible to pass, while deleting its assertions would remove protection for executable templates.

**Required plan edit:** Assign this audit to the source move/consultation work explicitly, before its first affected group gate. Specify a narrow replacement contract that permits recommended project-document reads with applicability, equivalents and warning-and-continue behavior, while retaining rejection of hard dependencies on consumer-owned executable/configuration templates. Add discriminating positive and negative cases to the Derived Test Matrix and the owning task. Verify that an unconditional mandatory read still fails and a correctly qualified project-doc consultation passes. This implements the already-approved ownership boundary; it does not require a design change.

### C2 — Current-run artifact selection has only a pure-function test (plan edit)

Task 6 changes `workflows.ts` to supply current-run artifacts at summary and handover, but its only warning test targets `summary.test.ts`. That suite supplies an in-memory `read` callback (`.bkit/core/engine/commands/workflow/summary.test.ts:5`) and constructs `SummaryInput` itself. It can validate deduplication after the correct inputs have been selected, but cannot detect a production caller that omits warnings, reads a prior run, or includes raw tracker/input files.

The real selection and read boundary is `summaryVerb` in `.bkit/core/engine/commands/workflow/workflows.ts:1695`: it reads the status file, resolves the latest run and constructs filesystem reads before calling `buildSummary`. The current-run provenance requirement is therefore a separate changed surface. The plan's CLI smoke never invokes `workflows summary` or the changed handover path.

**Required plan edit:** Add a non-mock filesystem/dispatch regression case for the changed caller, using the existing scratch-tree command-test pattern at `.bkit/core/engine/commands/workflow/workflows.test.ts:2913` or a dedicated integration file. Write two runs, attributed agent artifacts, a raw-input file containing a warning-shaped section, and a missing optional artifact. Invoke the real command and read the emitted summary from disk. Assert that only the active run's attributed warnings appear, duplicates collapse, the verdict is unchanged, and a subsequent run can report the unresolved gap again. Exercise handover as well if it supplies artifacts through a distinct route. Give this boundary its own matrix row and owning task while respecting the per-task file cap.

## OPTIONAL

1. **Shared marker parser:** `findLineAnchoredMarkers` is used by install writers, upgrade/uninstall, managed-version detection, model override parsing and instruction tooling. Keep the wrapper-removal operation isolated so its CRLF/fenced-example handling does not silently change every existing consumer. Run the existing parser/writer tests alongside the migration fixtures. The plan already specifies preservation of still-managed blocks, so no broader parser redesign is needed.
2. **Known test timing risk:** `docs/failures.jsonl` retains the open `upgrade-managed-marker-restamp-timeout-release-gate` record. It names `upgrade.integration.test.ts:702`, a managed-version restamp case that exceeded its budget without an assertion mismatch. Task 1 changes the same lifecycle and Task 7 runs its full gate. Carry this verification caveat into the plan and report any recurrence without increasing timeouts, removing assertions or describing it as fixed by this feature. Diagnosis of that existing timing issue is separate from the document-ownership behavior.
3. **Known invariants acknowledged:** Preserve read-only Phase 3 detection (`kn-4-phase-3-runs-only-in-install-not-check-dry-run-parity`), synchronize both shared-clause text and local instruction entries (`instructions-store-clause-text-and-local-entries-need-hand-edits`), and verify the built CLI after cross-module imports (`workflow-ledgers-importing-tests-closes-a-steps-cycle`). The plan's split between lifecycle writes and detector reads, registry updates and built CLI smoke is consistent with those prior fixes.

## OUT OF SCOPE

None. The findings above concern the approved ownership, consultation and warning changes. They do not propose a new adoption CLI, external service, dependency, or a general migration framework.
