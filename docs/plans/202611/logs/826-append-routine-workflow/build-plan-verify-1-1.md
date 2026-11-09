Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 3
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 1: Tasks 1, 2 and 3 across the supplied briefs, including retained Task 3 implementation. Judged against the supplied group diff and current code.

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

Task 3 satisfies its persistent state, target/invocation binding, exact source, receipt compatibility and diagnostic fallback requirements. Tasks 1 and 2 have the two reproducible gaps below. Future publisher Task 5 and Task 10 live lifecycle coverage are outside this group.

The investigated Jira cache-target concern is not a gap: `trackerTarget` leaves `ownerRepo` empty for Jira, so `jiraSite` participates in the progress binding.

Reviewed the supplied implementation, test-first, green-test, plan-current and provider-contract reports. Evidence records 75 passing tracker tests, passing generator/fresh-consumer checks and the changed gate with 2,361 related plus 3,634 named tests. Independent, non-mutating probes against the built tracker exports reproduce both gaps despite those passing checks. No broad suite rerun was necessary.

The test-first report has no unresolved audit gaps or unproven tests. Its already-landed tests were: `uses accepted final preflight eligibility without provider atomicity` (existing adapter returned identity, author and fingerprint without requiring ETag; unknown author remains sealed); `budgets the entire encoded body at limit and overflow` (existing splitter counted ordinary marker and continuation overhead); and `uses legacy receipts and contains receipt failures` (existing receipt handling preserved acknowledged publication when receipt persistence failed). These reasons explain prior green results, but ordinary continuation coverage missed the three-digit case below. No planned expectation was loosened; the Jira fixture update preserves deduplication assertions while reflecting the direct comments-list contract.

Fresh provider-contract evidence supports the GitHub, Linear and Jira adapter signatures and acknowledged mutations. Jira evidence is retained only for stable, attributable Markdown; HTML is sealed. Documentation work assigned to later groups is not a Group 1 gate. The owner's instruction to continue and ignore timeouts was considered; neither reported gap is a timeout.

## Identified Gaps Log

TASK 1: `.bkit/core/engine/commands/workflow/tracker.ts` `recentComments` — incomplete-creation-order: Linear sorts `str(createdAt)` and slices to the requested count before validating evidence. A comment with a missing creation timestamp sorts before valid timestamps and can disappear, leaving an older attributable comment advertised as the newest eligible evidence even though ordering is inconclusive. Smallest fix: validate creation timestamps for every fetched ordering candidate before sorting/truncating; fail or seal inconclusive reads, and compare parsed instants rather than lexical timestamp strings. Add a regression with one attributable dated comment and one undated foreign comment. Exact non-mutating reproduction from the worktree (Node 22+, built exports):

```sh
node --input-type=module <<'JS'
import { recentComments } from './dist/commands/workflow/tracker.js';
process.env.BKIT_LINEAR_API_KEY = 'synthetic-test-only';
globalThis.fetch = async () => new Response(JSON.stringify({ data: { issue: { comments: {
  nodes: [
    { id: 'own', body: 'own', createdAt: '2026-11-01T00:00:00Z', updatedAt: '2026-11-01T00:00:00Z', user: { id: 'owner' } },
    { id: 'foreign', body: 'foreign', updatedAt: '2026-11-02T00:00:00Z', user: { id: 'human' } },
  ],
  pageInfo: { hasNextPage: false },
} } } }), { headers: { 'content-type': 'application/json' } });
console.log(await recentComments({ tracker: 'linear', issue: 'TEST-1', cwd: process.cwd(), ownerRepo: 'o/r', linearTeam: 'TEST', jiraSite: null, config: {} }, 1));
JS
```

Observed: a one-element result containing `own` with complete author/date/fingerprint evidence; the undated foreign candidate is silently discarded. Its creation order is unknown, so this cannot establish newest-comment eligibility. — Fixable: true

TASK 2: `.bkit/core/engine/commands/workflow/tracker.ts` `splitAt` — header-budget-overflow: Continuation overhead reserves the fixed label `_(part 99/99)_`, but generated labels grow beyond that reservation at 100 or more parts. This violates the task's full encoded-body budget requirement. Smallest fix: compute chunk capacity using the actual total-part digit count, iterating until stable (or use an equivalently safe bound), retaining Unicode-safe boundaries and rejection when no content fits. Add a regression crossing the 99-to-100-part boundary that checks every fully rendered part against the budget. Exact non-mutating reproduction from the worktree:

```sh
node --input-type=module <<'JS'
import { splitAt, stampMarker } from './dist/commands/workflow/tracker.js';
const parts = splitAt(stampMarker('###### bkit:generated\n' + 'x'.repeat(10000)), 100);
console.log({ parts: parts.length, maxLength: Math.max(...parts.map(part => part.length)), over: parts.filter(part => part.length > 100).length });
JS
```

Observed: `{ parts: 200, maxLength: 102, over: 191 }`; 191 complete rendered comments exceed the requested 100-unit budget. — Fixable: true
