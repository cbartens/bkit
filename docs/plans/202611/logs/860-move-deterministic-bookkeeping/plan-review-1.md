Verdict: CONCERNS
Failures: 3
Redesign: false

<!-- verdict:end -->

# Plan Review

Lens: Tightness — task dependency order, design-coverage.

## CRITICAL

### C1 — General CI observations cannot satisfy the failed-run selection contract (plan edit)

**Source requirement:** `deterministic-bookkeeping-5` requires durable found/none/error observations and resumed polling, including periods before a run is found. The accepted decisions do not restrict this to failed runs.

**Evidence:** `plan-v1-draft.md:216` (R18) requires handoff identity to match `validateCiSelection`; the architecture at line 261 explicitly persists general poll identity through that validator. Task 7 at line 410 carries this reuse forward. In `.bkit/core/engine/ledgers/status.ts:27`, `CiSelection` is either local or a selected failed GitHub run. Its validator at line 46 requires a positive run ID and attempt, canonical attempt URL, workflow ID/path, head SHA, `redTiers`, `via`, and a conclusion of `failure`, `timed_out` or `startup_failure`. A no-run observation has no run ID; a queued, running or successful run cannot satisfy the failed conclusion constraint. The proposed consumer therefore lacks a compatible evidence contract.

**Required correction:** Change R18 from unchanged reuse to reuse of applicable identity validation within an explicitly extended handoff union. Assign the target/observation types and validation to Task 7's existing `ledgers/status.ts` owner. Keep the existing debug failed-run selection semantics intact. State which identity fields exist before discovery and become mandatory after discovery, and how provider errors and unresolved retrigger intent are represented. Extend the existing Task 7 matrix/tests to cover none, pending, success, failure and provider error across process restart, with stale target rejection. This changes neither the approved storage choice nor the provider implementation.

### C2 — Shared audit validation has no cycle-free owner (plan edit)

**Source requirement:** `deterministic-bookkeeping-6` and the reuse mandate require one validated audit representation to supply the report, ledger payload and comment.

**Evidence:** Task 6 at `plan-v1-draft.md:389` assigns audit validation/rendering to `commands/workflow/steps.ts` and makes `commands/workflow/issues.ts` consume the same validated representation. The existing dependency is already `steps.ts → issues.ts`: `.bkit/core/engine/commands/workflow/steps.ts:51` imports `buildComment`. Importing the planned shared validator back from steps into issues closes a cycle. Implementing a second validator in issues instead defeats the single-source requirement. The plan names neither a leaf owner nor a validated artifact contract that avoids this dependency. The ACTIVE knowledge row `workflow-ledgers-importing-tests-closes-a-steps-cycle` records that command-module cycles here can pass type checking and unit tests but break the compiled CLI.

**Required correction:** Name a cycle-free shared owner and exported contract in the architecture, reuse matrix and runbook before both consumers use it. Prefer extending an appropriate existing lower-level module after checking its imports; alternatively put the shared audit contract in the existing issues owner if steps can consume it without a reverse dependency. Task 5/6 must explicitly produce the common validation/derivation API or validated artifact schema, with consumers depending on that production. Include a compiled CLI smoke check in the same group so a failing import graph is resolved before Group 3. Do not add a second serializer or publisher.

### C3 — Runless audit publication lacks the prerequisite for required receipts (plan edit)

**Source requirement:** `deterministic-bookkeeping-6` covers the existing independently invoked audit agent, and the plan explicitly preserves standalone callers. Its audit architecture also says all ledger writes use append with operation receipts.

**Evidence:** `plan-v1-draft.md:233–236` issues managed invocation IDs only from an exact status run and registered step. At lines 241–243, receipt-aware append requires both an engine-issued operation ID and invocation ID. At line 256, all audit ledger writes require those receipts. Task 6 consumes that append path and Task 9 migrates `bkit-audit-generate`. However, `.bkit/core/engine/commands/workflow/step-table.ts:30` registers only plan/design/build/debug/ship; `.bkit/core/prompts/bkit-audit-generate.md:40–53` accepts independently supplied inputs and output paths, without requiring a workflow run. `.bkit/workflows.md:179` explicitly permits agents to run on their own. An audit with no FID/status run therefore has no specified producer of the invocation/operation prerequisites. The explicit standalone `--agent` for result serialization does not supply append receipts.

**Required correction:** Specify the standalone audit invocation/receipt route and assign its producer to Task 1 or Task 4 before Task 6 consumes it. Preserve verified identity and unavailable-model rules without inventing a numbered workflow run. If the intended contract instead keeps this caller in legacy append mode, state that exception consistently and reconcile it with the audit replay acceptance scope; do not leave the caller to choose. Add a Task 6 real-files scenario starting with no active run/status/FID, generating the result and ledger rows, then replaying the same publication. Apply the same explicit choice to migrated utility writers. This is a missing invocation-mode detail within the accepted defaults, not a request for a new workflow or design phase.

## OPTIONAL

1. **Mechanical plan correction:** Convert `plan-v1-draft.md:521`'s `Docs updated` task-like checkbox outside the runbook to ordinary prose or a permitted template field. The supplied plan-check identifies this stray task; no missing-file findings were reported. Re-run the existing plan checker after the edit.

2. **Coverage and ordering:** All eight audit Expected outcomes map to tasks, and the later issue decisions supersede the audit's earlier suggestion to run design. No unrelated implementation task or mandatory design artifact was found. The declared graph is acyclic and ordered: T1 context → T2 attribution → T3 query → T4 receipts → T5 artifacts → T6 audit; T7 CI depends on T1/T4; T8 recovery depends on T1/T2/T4/T7; T9 callers depends on T1–T8. Existing files supply the other prerequisites. Groups contain three tasks each and 9/10/8 planned tests, below the supplied caps. Each logic task owns tests in at most three files. No declared test is intentionally left failing until a later group. C1–C3 concern missing or incompatible consumed contracts, not a reorderable task-number cycle.

3. **Reuse assessment:** The 24-family inventory identifies the right existing command owners and separates implemented flags from proposals. In particular, extending `steps stub`, the canonical telemetry fold, existing append/action machinery, counters, polling and tracker publication avoids parallel services. Preserve the explicit distinctions already in the plan: raw relevance search versus canonical query; configured model versus observed model; strict ledger operation collision versus intentional changed-body tracker updates; exclusive creation versus automatic stale-lock reclamation. C1 and C2 correct places where a named reuse candidate is not directly reusable as written.

4. **Evidence limits:** This was a source/plan review, not an execution of the proposed tests. The supplied failures context explicitly drops 13 of 30 lines; no claim is made that those omitted failures are clean or irrelevant. The worktree TypeScript symbol overview was unavailable, so bounded source reads supplied dependency evidence. Related issue bodies describe closed prior implementations; they are compatibility context, not open blockers.

## OUT OF SCOPE

None. No implementation, plan changes, new host detector, tracker publisher or unrelated recovery work was performed. The corrections above keep the eight accepted findings and six owner defaults.

## SUGGESTED SCOPE EXPANSION

- `58-status-jsonl-run-boundary-keys-on-last-run-overall` — `related-deferrals.md`, TRIAGED; overlaps exact-run binding and persistent correction/CI budgets. Recommend checking the new invocation path against interleaved workflow runs and retaining the existing issue's independent ownership; do not silently enlarge #860 into a full legacy run-boundary rewrite.
- `ledger-envelope-workflow-field-not-universal` — `related-deferrals.md`, OPEN; overlaps independently invoked ledger writers and C3. Recommend stating the compatible standalone contract while leaving broader manual-row schema cleanup with its owner.
- `58-counter-row-countername-value-pairing-unverified` and `58-debug-run-tests-parentsha-advances-only-transitively` — `related-deferrals.md`, OPEN; overlap counters/status touched by Tasks 1/7/8. Recommend compatibility checks and separate follow-up for the historical counter semantics, not adding those fixes to this runbook.
- `650-debug-dev-ci-live-round-trip` — `related-deferrals.md`, TRIAGED; overlaps Task 7 target evidence. Recommend retaining its separately owned live proof; the planned local persistence tests do not close that live deferral.
- CI lookup/context/revalidation timeout rows — `related-failures.md`, OPEN; overlap `runs.test.ts`. Recommend preserving test assertions and checking unchanged gates with the existing resource-contention guidance; do not fold broad timeout remediation into #860.
- Closed #680/#659/#710/#677/#679/#452 — `related-issues.md`; overlap ledger envelopes/writers/compaction, lifecycle identity, existing command reuse and ship bookkeeping-root relocation. Recommend preserving their shipped contracts in the named task tests, with no reopened or bundled scope.
