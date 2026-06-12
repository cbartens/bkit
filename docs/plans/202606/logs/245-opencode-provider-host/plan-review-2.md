Verdict: PASS
Failures: 0

<!-- verdict:end -->

# Plan Review

Lens: Dependency correctness, design-coverage.

## CRITICAL

None. The phase dependency graph is acyclic and every declared cross-phase
prerequisite is consumed by a downstream task that needs it. All `[MODIFY]`
targets and the symbols the plan depends on were verified to exist this session
(`applyT1/T2/T3`, `parseModelLookup`, `Host` type in `bkit-install.ts`;
`runClaudeModule`/`runCursorModule`, `MODULE_REGISTRY`, `MODULE_DISPATCH_ORDER`,
`ModuleContext.modelLookup` in `bkit-modules.ts`; `ModuleName`/`MODULE_MANIFESTS`/
`CLAUDE_MANIFEST`/`CURSOR_MANIFEST` in `bkit-manifest.ts`; `ModuleFlag`/
`MODULE_FLAGS`/`ALL_MODULES`/`OPTIN_MODULES` in `bkit-cli.ts`; the 45 router
identifiers in `bkit-mode.sh`; the `agent_id` subagent-exemption + fail-open
contract in `gateguard.cjs`; `providers.md` § "Local / NVIDIA model swap" at L265
and § Models at L70). No fabricated dependency edges, no missing prerequisites,
no cycles.

## OPTIONAL

- **Task 1.2 / 1.3 mutual coupling (ordering, not a cycle).** Task 1.2 implements
  `parseOpencodeModelLookup` AND its Done-when asserts "the parser returns all 46
  agent names with no missing entries" — but the `opencode model` column those
  names are read from is not added until Task 1.3. Symmetrically, Task 1.3's
  Done-when invokes `parseOpencodeModelLookup('.bkit/prompts.md')` (the function
  built in 1.2). Neither task can satisfy its own Done-when in isolation. This is
  a soft data-dependency that resolves if executed 1.2→1.3 back-to-back, but the
  per-task verification gates ("complete each task fully including its
  verification before starting the next" per the runbook header) will stall: 1.2's
  green-test criterion cannot pass before 1.3 exists. Recommend either (a) reorder
  so the column lands (1.3) before the parser's 46-name assertion (1.2), or (b)
  merge the column-add into 1.2 and reduce 1.3 to the catalog-parity test +
  `effort`→`reasoningEffort` doc note. Non-blocking because the same agent owns
  both and the end state is consistent.

- **Phase 4 cross-reads Phase 2 output but declares no explicit dep.** Task 4.1
  rewrites `.opencode/agent/*.md` headers, which only exist after `runOpencodeModule`
  (Task 2.2) has rendered them. The phase ordering (4 after 2) implies this, and
  the plan places Phase 4 after Gate 2, so it is satisfied — but the dependency is
  positional only. A one-line "Requires: Phase 2 render output" on Task 4.1 would
  make the edge explicit for a resumed/out-of-order execution.

- **Phase 3 (GateGuard plugin) is order-independent but gated behind Gate 2.**
  Task 3.1 has no data dependency on Phases 1–2 (it is a standalone template +
  test file). It could run concurrently with Phase 1/2. Not a correctness issue;
  flagging only as a potential parallelisation opportunity if the milestone is
  time-pressured.

- **Design-coverage: no `{FID}-design.md` (by mandate).** The issue explicitly
  substitutes the recon comments + spike for a full `/bkit-design`, so there is no
  design artifact to cross-check task deps against. Coverage was therefore assessed
  against the issue body's Acceptance/Scope checklist — every issue bullet (spike,
  render target, transform, plugin port, mode redesign, Approach-A removal, tracker
  decoupling) maps to a phase/task, and the Supersession Inventory's DELETE rows are
  each mirrored both in Architecture & Component Changes and as Phase 6 removal
  tasks (6.1/6.2), satisfying the template's mirror requirement. No design-implied
  dependency is missing because no design exists; if a human later authors one,
  re-run this lens.

## OUT OF SCOPE

- Whether opencode is part of `--full` vs opt-in is left as a human-confirm
  decision (Breaking Changes § DEFAULT-INSTALL). That decision changes which
  constant Task 2.3 edits (`ALL_MODULES` vs `OPTIN_MODULES`) but does not alter
  the dependency graph — out of this lens's remit; correctly deferred to Gate 1.
- The opencode CLI dir-name confirmation (`agent` vs `agents`, `command` vs
  `commands`) is correctly deferred to the spike. It affects manifest path
  literals, not task ordering.
