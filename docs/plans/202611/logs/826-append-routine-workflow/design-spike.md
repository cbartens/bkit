Verdict: CONCERNS

<!-- verdict:end -->

# Design Spike

## Claims

Claims follow the review's blast radius, with the narrower observation under claim 1 recorded separately so it cannot be mistaken for an end-to-end pass.

1. **Provider acceptance matrix — BLOCKED.** Each of GitHub, Linear and Jira supports the required create/edit/read cycle, stable comment identity, creation ordering, dependable external-edit evidence, h6 marker extraction and the design's encoded-body budget. Every adapter and the all-three-tracker outcome rest on this claim. Full coverage requires actual provider mutations and boundary requests, including non-BMP text and complete headers.
2. **GitHub observation prerequisites — SETTLED within the observed sample.** The existing authenticated GitHub transport can retrieve stable comment IDs, author metadata, creation/update times and exact body text for the current issue, and its ordinary generated h6 markers survive retrieval. Adapter enrichment and body-fingerprint evidence rest on these prerequisites. This is a read-only observation of four existing comments, not proof of create/edit normalization, revision collision freedom, pagination under load or a conditional newest-comment mutation.
3. **Lost-response reconciliation — BLOCKED.** A successful remote create or edit whose response is lost can later be recognized through the production read path without another mutation. Prepared operations, acknowledgment recovery and retry behavior rest on this claim. It needs a verified mutation round trip plus deliberate response loss; no service was stubbed or simulated.
4. **Lifecycle persistence — BLOCKED.** Bootstrap identity and body/receipt adoption, plus terminal receipts after the close commit, survive process restart and session/worktree cleanup. Startup, auto dispatch and close deduplication rest on this claim. These are proposed mechanisms; no implementation fixture exists to execute without building the design. Implementing them during this spike would exceed its scope.

## Method

Both probes are single files under `docs/plans/202611/logs/826-append-routine-workflow/spike/`. They ran from the feature worktree. No dependency was installed, no remote comment was created or edited, and no generated build output was retained.

- `availability.mjs` reports only whether the three named credentials are present. It never reads their values into output. Command: `direnv exec . node docs/plans/202611/logs/826-append-routine-workflow/spike/availability.mjs`.
- `github-read.ts` calls the existing `trackerTarget`, `gh` and `recentComments` functions. It requests the last five comments with explicit raw metadata, calls the production reader, then repeats the raw query. It compares IDs and SHA-256 body fingerprints in memory and prints booleans and counts only. Command: `direnv exec . pnpm exec tsx docs/plans/202611/logs/826-append-routine-workflow/spike/github-read.ts`.

The GitHub query requests `id body url createdAt updatedAt author{login}` and `pageInfo{hasPreviousPage hasNextPage}`. No returned discussion text, author identity or token is copied into this report. Existing remote content was treated only as data. The sample was complete for this issue at the time of the probe because both page flags were false; this does not exercise multi-page retrieval.

For claims 1 and 3, the parent limits this spike to read-only GitHub operations, and the availability probe found no Linear or Jira credential. A bounded program cannot honestly establish these mutation claims in this run. For claim 4, the review identifies design work and future implementation fixtures rather than an existing executable contract; no replacement publisher was written.

## Evidence

### Availability probe

Captured output, word for word; exit code `0`:

```text
direnv: loading ~/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow/.envrc
BKIT_GH_TOKEN=set
BKIT_LINEAR_API_KEY=unset
BKIT_JIRA_API_KEY=unset
jira_live_roundtrip=blocked_without_key_and_disposable_issue
linear_live_roundtrip=blocked_without_key_and_disposable_issue
github_mutation_roundtrip=blocked_by_read_only_probe_scope
provider_boundary_writes=not_attempted
```

### GitHub observation probe

Captured output, word for word; exit code `0`:

```text
direnv: loading ~/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow/.envrc
raw_comment_count=4
production_comment_count=4
raw_metadata_complete=true
production_keys=body,url
production_bodies_match_raw=true
generated_h6_first_lines=4
repeat_read_same_ids_and_body_fingerprints=true
raw_creation_order_ascending=true
has_previous_page=false
has_next_page=false
scope=existing_comments_read_only_no_mutation_or_lost_response_injected
```

The first GitHub probe invocation had an extra `../` in its local import and exited `1` before reaching a provider. Its diagnostic was `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/Users/christian/Documents/GitHub/bkit/.worktrees/.bkit/core/engine/commands/workflow/tracker.ts' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow/docs/plans/202611/logs/826-append-routine-workflow/spike/github-read.ts`. The import was corrected to the feature worktree's existing source, and the successful output above is from that rerun. This setup error is not evidence against a provider claim.

The configured language server also rejected the ignored worktree path with `ValueError: Explicitly requested symbols in '.worktrees/826-append-routine-workflow/.bkit/core/engine/commands/workflow/tracker.ts' while the path is ignored`. Bounded source reads confirmed the existing exported functions used by the probe.

## Design Impact

None. No claim is `DISPROVEN`.

The settled GitHub observation supports enriching the current adapter through its existing authenticated transport. The runtime result `production_keys=body,url` confirms that the proposed metadata still needs to be carried through the production reader. Stable fingerprints across two unchanged reads are only a prerequisite: a design revision must still define how a later body edit, missing evidence or normalization difference causes rollover. Marker presence alone does not establish revision equality.

## Unsettled

- **Claim 1:** Needs authenticated disposable Linear and Jira issues, their credentials, and permission for bounded create/edit/read and size-boundary requests; GitHub also needs a disposable target or a separately authorized mutation test. Capture actual returned schemas, IDs, representation/revision evidence, ordering/page behavior, notification behavior where observable, and precise ASCII/non-BMP/header-inclusive limits. Until then, all-three-provider consolidation and exact size/counting claims remain unverified. The unavailable credentials are `BKIT_LINEAR_API_KEY` and `BKIT_JIRA_API_KEY`; their absence was probed, not assumed.
- **Claim 3:** Needs the verified provider mutations from claim 1 and a single-file probe that discards a successful response then reconciles through the production read path. No lost response was injected in this run. The unchanged create-only agent fallback can still duplicate an uncertain successful write; this spike supplies no exactly-once guarantee.
- **Claim 4:** Needs a concrete design for invocation propagation/adoption and terminal receipt ownership, then implementation fixtures exercising restart, adoption and cleanup. Reading the existing source is insufficient evidence of a mechanism that does not exist yet. No implementation was added to manufacture a passing result.
- **Owner acceptance:** The review's two departures—newest-at-final-preflight ordering and uncertain fallback duplication—require owner decisions. A probe cannot supply that approval. Keep their stated strict defaults unresolved until the owner answers.

## Verdict Reasoning

`CONCERNS` because the read-only GitHub prerequisite held for the complete observed four-comment sample, while the full provider matrix, mutation recovery and proposed lifecycle persistence remain `BLOCKED`. Nothing was disproven. The blocked claims must remain explicit implementation/acceptance dependencies; ordinary standalone fallback does not establish all-three-provider consolidation. The probe files are confined to the spike directory, no dependencies or build outputs remain, and no production source or remote comment was changed.
