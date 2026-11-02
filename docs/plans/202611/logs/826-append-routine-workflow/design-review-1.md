Verdict: CONCERNS
Spike: true

<!-- verdict:end -->

# Design Review

Lens: Buildability — prior art, stack feasibility, library fit, integration risk.

## Prior Art Search

<!-- prettier-ignore -->
| Capability | Existing solution, fit and gaps | Recommendation |
| --- | --- | --- |
| Shared publication and fallback | `tracker.ts` already centralizes `postForVerb`, `postCommentOnce`, body files, markers and tracker transports. Its production callers include `issues.ts`, `steps.ts` and `workflows.ts`. Existing success receipts and recent-comment matching cover ordinary duplicate suppression, but not aggregation or uncertain mutations. | EXTEND-EXISTING. This covers the transport and caller boundary; retain one publisher and add delivery policy there. |
| Section identity and delivery history | `ledgers/status.ts` supplies `actionKey`, SHA-256 `actionHash`, `alreadyDone` and append-only `recordAction`. These are established engine mechanisms. They lack prepared operations and references to retained source bodies. | EXTEND-EXISTING. Preserve existing key-plus-original-body semantics and compatible historical receipts. |
| Source retention and invocation bootstrap | Run log artifacts and the Git-common session outbox exist. `repo.ts` creates session directories; it does not already implement the proposed cross-call invocation resolver. `RunContext` has flags, cwd and output services rather than explicit workflow/run identity. | EXTEND-EXISTING. Add explicit association/adoption to those mechanisms; specify its lifecycle rather than assuming the resolver exists. |
| Local serialization | `workflow/locks.ts` has exclusive creation, holder reads and ownership checks. These are mature internal primitives; workflow-duration locks do not by themselves serialize separate publication calls. Node documents native `wx` exclusive creation. | EXTEND-EXISTING. Reuse the primitives with a delivery-specific lifetime and existing stale-owner handling. [Node filesystem documentation](https://nodejs.org/api/fs.html) |
| Provider mutations and inspection | GitHub's comment update endpoint accepts an ID and body. Linear's current first-party schema exposes `commentUpdate` and `CommentUpdateInput.body`; Rovo documents `addOrEditJiraIssueComment` and paginated comment listing. Existing adapters omit metadata needed by the proposal: `PostedComment` returns URL/part count, and `recentComments` returns body/URL rather than stable identity and revision evidence. | EXTEND-EXISTING. Keep the current transports, expand adapter results, and prove the missing contracts. [GitHub](https://docs.github.com/en/rest/issues/comments#update-an-issue-comment), [Linear schema](https://raw.githubusercontent.com/linear/linear/master/packages/sdk/src/schema.graphql), [Rovo tools](https://developer.atlassian.com/cloud/rovo-mcp/guides/supported-tools/) |
| Budgeting and continuation | `tracker.ts` already contains `splitAt` and the 32,767 Jira threshold. Its current JavaScript string slicing and reserved `99/99` continuation header do not establish Unicode-safe splitting or exact accounting for arbitrary part counts and new markers. | EXTEND-EXISTING. Generalize this helper rather than adding a second splitter; verify actual provider counting semantics. |
| Recovery protocol | Native filesystem operations and existing SHA-256 hashing cover the primitives without dependencies. Standard idempotent retry practice uses stable request identity across retries; a local identifier alone does not make a provider mutation idempotent. | ADAPT. Apply prepared/acknowledged records within existing modules, retaining the design's explicit uncertain-outcome state. [Node crypto](https://nodejs.org/api/crypto.html), [AWS idempotent interaction guidance](https://docs.aws.amazon.com/wellarchitected/2025-02-25/framework/rel_prevent_interaction_failure_idempotent.html) |

The capability map contains no aggregation mechanism. Bounded searches and source reads in the existing tracker, status, session and workflow modules corroborate that gap. The configured language server rejected the ignored worktree path; text searches supplied the remaining evidence. No reuse caveat applies: the design's reuse verdicts are all extensions, and no fresh parallel subsystem is proposed.

## Stack Feasibility

Buildable with Node >=24, TypeScript, ESM and the repository's zero-runtime-dependency policy, subject to the critical items below. It requires no service, database or new package. Local locks, retained source, action records and HTTP/GraphQL/MCP adapters are all compatible with this CLI architecture.

The achievable ordering boundary is the final eligibility read. GitHub's documented update takes a comment ID and replacement body; it offers no documented issue-wide newest-comment predicate. A revision condition, if available, would still not prevent another comment being created concurrently. Likewise, an uncertain mutation followed by unchanged create-only fallback cannot promise unconditional duplicate freedom. The draft correctly names both limitations, but its weaker acceptance remains conditional on owner confirmation. [GitHub update contract](https://docs.github.com/en/rest/issues/comments#update-an-issue-comment)

All-three-provider support remains conditional on verified revision, marker and size contracts. Conservative standalone creation is a useful failure mode but does not prove the consolidation acceptance criterion for an unverified adapter.

## Library / API Evaluation

<!-- prettier-ignore -->
| Library / API | Maturity, footprint, types and license fit |
| --- | --- |
| Node filesystem and crypto | Established runtime APIs already used by the project. No added bundle or binary. Existing TypeScript Node declarations cover them. No new dependency license is introduced into the MIT-licensed repository. |
| GitHub REST through existing `gh` | Documented, established comment read/create/update API. Reuses the installed CLI rather than adding an SDK. Returned IDs, author, creation and update timestamps can seed typed adapter records, but responses still need validation. Hosted API use adds no redistributed library license. |
| Linear GraphQL | Official public GraphQL API with introspection and a typed SDK available. The current first-party schema confirms public `commentUpdate`; its internal `skipEditedAt` argument must not be treated as a supported notification control. Keep existing raw GraphQL transport to avoid SDK footprint. GraphQL responses may contain errors even with HTTP 200. Numeric comment limit remains unverified. No new dependency license. [API documentation](https://linear.app/developers/graphql), [schema](https://raw.githubusercontent.com/linear/linear/master/packages/sdk/src/schema.graphql) |
| Jira Rovo MCP | Official supported tools include editing and listing comments, but deployment scopes and discovered schemas determine availability. Retain `JiraSession` and its current credential path. Tool results require validation and normalization; published names alone do not establish all field types or revision guarantees. No additional runtime package or redistributed license. [Supported tools](https://developer.atlassian.com/cloud/rovo-mcp/guides/supported-tools/) |

The remote APIs are hosted contracts rather than libraries bundled by this change. Their undocumented behavior should be recorded as unknown, not assigned library-style stability guarantees.

## Integration Risk

The blast radius is the common posting path used across phases and all three providers. Policy mistakes can affect every routine report, while a classification mistake can fold a decision or terminal report into progress. Existing result fields and original `commentFile` behavior therefore need compatibility coverage.

The difficult boundaries are before `workflows start` and after workflow close. Bootstrap publication has no ordinary run yet. At the other end, `workflows.ts:2014` explicitly documents that `postClose` runs after the close commit; it calls `postForVerb` with only FID and cannot put a new action receipt into that commit. A proposal for durable standalone receipts must account for that current ordering rather than assuming every call has an open status run.

The repo is a single package with mirrored payloads, not a monorepo. Implementation belongs in the existing source modules; generated payload and host documentation consistency remain existing build/install responsibilities. Run artifact schemas must remain readable across resume and tolerate old engine-action records.

## PoC Approach

Use disposable issues for each tracker and the existing authenticated transports. Discover Rovo's actual tool schemas and introspect Linear. Create one marked two-section comment, capture identity/order/revision evidence, edit it, then retrieve it through the exact production read path. Check h6 and section-marker preservation, normalized representations, pagination and insertion ordering. Edit non-marker text as a human and verify that the proposed revision comparison notices it. Probe ASCII, non-BMP Unicode and header-inclusive boundary bodies to establish accepted size semantics. Simulate a lost response after successful create/edit and reconcile using the recorded identity without another mutation. Separately exercise local bootstrap adoption and terminal receipt persistence using existing workflow fixtures. Record requests, redacted results, supported fields, precise limits and unsupported guarantees. These probes establish contracts; they do not implement aggregation.

## Unknowns & Blockers

- Live provider behavior: Jira's discovered edit/list schemas and marker normalization; each adapter's dependable revision comparison; Linear's numeric limit; and actual encoded-body counting for all adapters. Runtime probes are needed where authoritative contracts do not settle these facts.
- Recovery evidence: whether the production read path exposes sufficient identity and intended revision evidence after a lost create/edit response. A deterministic fault-injection probe can settle local reconciliation behavior once provider evidence is known.
- Bootstrap and terminal lifecycle: exact identity propagation, adoption and post-close receipt storage. This resolves primarily by source inspection and a concrete design decision, followed by fixtures during implementation.
- Owner decisions on final-preflight ordering and uncertain fallback duplicates remain explicit acceptance blockers; experimentation cannot supply that approval.

## Verdict Reasoning

CONCERNS because the existing architecture and transports can support the proposal, and reuse is appropriate, but provider evidence and two lifecycle details remain necessary before an executable plan can claim the stated behavior. These are addressable caveats rather than evidence that the approved stack is unsuitable. Spike is true because marker round trips, effective provider limits and lost-response reconciliation cannot all be settled by the available public documentation alone.

## CRITICAL

1. **Complete the provider acceptance matrix.** Linear edit support is now established by its first-party schema; remove that schema question from the unknowns. Still record, per tracker, the exact create/edit/read contracts, stable IDs, creation ordering/pagination, revision evidence, marker extraction and verified body budget/counting unit. Run a bounded contract spike for undocumented behavior. If an adapter cannot supply these, explicitly block its consolidation acceptance rather than treating standalone fallback as satisfying all-three-provider support.
2. **Define revision equality strongly enough to detect edits that preserve markers.** A generated marker and an unchanged aggregate revision heading do not prove unchanged content. GitHub's documented timestamps alone do not establish a collision-free revision token. Specify either a provider revision guarantee or a fingerprint of a stable returned representation retained at acknowledgment, including how normalization and missing evidence are handled. Remote content may be hashed as evidence without becoming the source for outgoing bodies. Roll over when comparison is inconclusive. The existing final-read race remains separately disclosed.
3. **Specify durable identity and receipt ownership at both lifecycle edges.** Name how the first routine call receives a stable session invocation, how auto reuses it, and where adoption is recorded. The source has session directories but no ready-made shared invocation resolver. Also define where standalone terminal preparation/acknowledgment lives after the close commit and how later retries resolve that identity. Include worktree/session cleanup in this decision. Otherwise the proposed historical dedupe guarantee has a gap precisely at final close / Create PR.
4. **Resolve the two explicit acceptance departures before treating the design as approved.** The supplied input accepts Q4; the draft itself correctly says chronology and unconditional retry deduplication departures remain unconfirmed. Retain its strict defaults until the owner accepts the proposed weaker boundaries. This is an acceptance dependency, not a request to invent provider atomicity.

## OPTIONAL

Document a small adapter capability table beside the existing interaction catalog, including edit-notification limitations and the reason an adapter rolls over. Keep provider-specific evidence out of generic workflow policy.

## OUT OF SCOPE

Cross-machine coordination services, notification suppression beyond supported provider contracts, migration of existing tracker comments, and changing agents' create-only fallback are outside this design.
