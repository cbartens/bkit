Verdict: FAIL

<!-- verdict:end -->

# Build Plan Tests

## Test Log
SOURCE — TASK 2: stamped generated-marker bytes from .bkit/core/engine/commands/workflow/tracker.ts:382; full-body limit and part labels from .bkit/core/engine/commands/workflow/tracker.ts:414

PASSES — TASK 2: `.bkit/core/engine/commands/workflow/tracker.test.ts` `budgets the entire encoded body at limit and overflow`: existing splitAt includes generated marker and continuation labels in its UTF-16 code-unit limit.

WROTE — TASK 2: `.bkit/core/engine/commands/workflow/tracker.test.ts` `keeps non BMP code points intact in deterministic parts`

SOURCE — TASK 3: legacy engine-action key/hash/ref shape from .bkit/core/engine/ledgers/status.ts:281; receipt I/O failure containment from .bkit/core/engine/commands/workflow/tracker.ts:1080

PASSES — TASK 3: `.bkit/core/engine/commands/workflow/tracker.test.ts` `uses legacy receipts and contains receipt failures`: existing postCommentOnce reuses recordAction receipts and preserves acknowledged new-comment success when the receipt parent is a real file.

SOURCE — TASK 1: GitHub id/user.id/body/html_url/created_at/updated_at and Linear id/user.id/body/url/createdAt/updatedAt create/edit/read shapes from docs/plans/202611/logs/826-append-routine-workflow/build-provider-contracts.md; pagination cursor and 100-item maximum from https://docs.github.com/en/graphql/guides/using-pagination-in-the-graphql-api.

WROTE — TASK 1: `.bkit/core/engine/commands/workflow/tracker.test.ts` `selects newest created comment across complete pages`

SOURCE — TASK 3: explicit workflow/run association from runActionKey in .bkit/core/engine/commands/workflow/tracker.ts:1143; Git-common outbox placement from the plan Architecture and Component Changes; source cache version/path remains implementation-owned.

WROTE — TASK 3: `.bkit/core/engine/commands/workflow/tracker.test.ts` `caches exact engine source with available progress identity`

WROTE — TASK 3: `.bkit/core/engine/commands/workflow/tracker.test.ts` `keeps original body identity separate from time and changed output`

WROTE — TASK 3: `.bkit/core/engine/commands/workflow/tracker.test.ts` `reuses matching invocation state without adopting foreign ownership`

WROTE — TASK 3: `.bkit/core/engine/commands/workflow/tracker.test.ts` `invalidates missing corrupt and unsupported progress cache`

WROTE — TASK 3: `.bkit/core/engine/commands/workflow/tracker.test.ts` `contains cache read and write failures as standalone degradation`

WROTE — TASK 1: `.bkit/core/engine/commands/workflow/tracker.test.ts` `returns owned comment identity and stable representation evidence`

WROTE — TASK 1: `.bkit/core/engine/commands/workflow/tracker.test.ts` `rejects marker preserving external edits`

SOURCE — TASK 2: versioned h6 section-marker example from docs/plans/202611/826-append-routine-workflow-design.md:141; generated Markdown/HTML marker parsing from .bkit/core/engine/commands/workflow/tracker.ts:390; original step timestamp/group/attempt fields from .bkit/core/engine/ledgers/status.ts:24.

WROTE — TASK 2: `.bkit/core/engine/commands/workflow/tracker.test.ts` `preserves generated first line and extracts versioned h6 section markers`

WROTE — TASK 2: `.bkit/core/engine/commands/workflow/tracker.test.ts` `reuses original section time without changing duplicate identity`

BLOCKED — TASK 1: `.bkit/core/engine/commands/workflow/tracker.test.ts` `edits by verified comment id through each existing transport` — postComment currently accepts only target and body; the task does not specify an ID-based edit selector/signature. Jira Rovo deployed edit schema remains unverified after authenticated initialization returned HTTP 401 invalid_token; see build-provider-contracts.md.

BLOCKED — TASK 1: `.bkit/core/engine/commands/workflow/tracker.test.ts` `seals unavailable or unstable representation evidence` — adapter tests must stay independent of the later publisher, but no inspection/eligibility input or result contract identifies sealed evidence. Existing recentComments returns legacy body/url records, which cannot express this state without inventing an interface.

BLOCKED — TASK 1: `.bkit/core/engine/commands/workflow/tracker.test.ts` `uses accepted final preflight eligibility without provider atomicity` — no adapter-level expected revision/ownership input or eligibility result is specified on postComment/recentComments. Testing the later publisher would cross the task’s explicit adapter-independence boundary.

BLOCKED — TASK 2: `.bkit/core/engine/commands/workflow/tracker.test.ts` `refuses aggregation with an unverified provider budget` — splitAt accepts a numeric limit and postCommentOnce exposes no provider-capability/budget input. No verified Linear counting budget or controllable unknown-budget contract is supplied; assuming a fixed limit or inventing a new option would fabricate the contract this test must establish.

BLOCKED — TASK 1: `.bkit/core/engine/commands/workflow/tracker.test.ts` `edits by verified comment id through each existing transport` — Retry after build-tests-red-1-1.md: GitHub and Linear deployed edit schemas are now verified, but the unchanged postComment(target, body) signature still has no ID/edit selector. The all-three-transport test also remains blocked by Jira MCP V2 Bearer initialization returning 401 invalid_token, so no deployed Jira edit schema can be used honestly.

BLOCKED — TASK 1: `.bkit/core/engine/commands/workflow/tracker.test.ts` `seals unavailable or unstable representation evidence` — Retry after build-tests-red-1-1.md: the unchanged recentComments(target, n) result exposes only body/url, and no adapter-level expected representation or sealed/unavailable result is specified. Exact status-file/runActionKey binding resolves publisher/cache tests, not this adapter-only eligibility assertion. Testing publisher rollover would violate this task’s adapter-independence requirement.

BLOCKED — TASK 1: `.bkit/core/engine/commands/workflow/tracker.test.ts` `uses accepted final preflight eligibility without provider atomicity` — Retry after build-tests-red-1-1.md: observed GitHub/Linear mutation fields establish raw evidence but do not define an input for saved ownership/revision or an adapter eligibility result on the unchanged postComment/recentComments seams. No atomicity requirement will be invented, and a later publisher test is outside this adapter-only test.

BLOCKED — TASK 2: `.bkit/core/engine/commands/workflow/tracker.test.ts` `refuses aggregation with an unverified provider budget` — Retry after build-tests-red-1-1.md: Linear comment counting remains explicitly unverified in build-provider-contracts.md, and no existing seam lets the test supply or invalidate provider budget evidence. splitAt requires a numeric limit; postCommentOnce accepts only file/key/recent/log. A fabricated numeric limit or new capability option would not prove the required unknown-budget behavior.

SOURCE — TASK 2: Compiler-only repair outside all planned test case bodies: the file now references the actual TypeScript 7.0.2 es2024.string standard library, whose shipped String interface declares isWellFormed; progressFiles explicitly requests utf8 filename encoding from readdirSync. pnpm bkit:typecheck:tests and pnpm bkit:lint:file .bkit/core/engine/commands/workflow/tracker.test.ts both exited 0. No planned assertion, source file, tsconfig or plan changed; the four existing test blockers remain.
