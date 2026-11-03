## Owner answers

The existing answers below are carried verbatim from `design-answers-2.md`. The later controlling clarification applies wherever an earlier delivery or persistence guarantee conflicts. The current plan reuses these recorded decisions rather than asking the settled questions again.

### Question 1

**Chronology departure from Q4:** Accept newest-at-final-preflight, with local serialization and postflight detection, as the enforceable boundary? Options: A) Accept this boundary — consolidation ships with an explicit remote race. · B) Retain the literal never-edit-after-an-intervening-comment guarantee — block editing on any adapter without verified atomic support. Recommended: A), because the documented GitHub update contract supplies no issue-wide newest predicate. Default if unanswered: B); the strict accepted guarantee remains unresolved and must not be silently weakened.

Owner's answer: A, accept the recommendation. Next question.

Decision: 826-newest-at-final-preflight

### Question 2

**Uncertain-delivery departure from Q4:** Accept that an unresolved write followed by the unchanged agent fallback may duplicate a report? Options: A) Accept the disclosed exception after attempted reconciliation — preserves the required fallback behavior. · B) Require unconditional no-duplicate delivery — block the posting change until a compatible idempotent provider / fallback contract is proven. Recommended: A), because local records cannot prove a remote outcome through an outage. Default if unanswered: B); unconditional retry deduplication remains unresolved.

Owner's answer: A)

Decision: 826-uncertain-write-fallback-duplicates

### Question 3

**Provider contract evidence after the spike:** Linear's first-party schema settles edit support, and the read-only GitHub sample settles only the metadata prerequisites recorded in the matrix. Live mutation, normalization, external-edit detection, pagination and exact size boundaries remain unverified across the full provider matrix; the spike found no `BKIT_LINEAR_API_KEY` or `BKIT_JIRA_API_KEY`. Options: A) Retain all three adapters in scope and require authenticated disposable-target contract evidence before their consolidation acceptance — preserves the requested outcome without claiming a pass. · B) Ask the owner to narrow delivery to verified adapters and file separate work for the rest — permits a smaller release but departs from the issue. Recommended: A), because unavailable credentials do not prove that an adapter cannot meet the contract. Default if unanswered: A); each incomplete matrix row remains an acceptance blocker, and standalone fallback does not close it.

Owner's answer: A)

Decision: 826-three-provider-contract-evidence

### Question 4

**Lost-response recovery evidence:** The spike did not inject a lost create/edit response, so recovery is designed but unproven through the production read path. Options: A) Require a bounded mutation-and-discard probe on each accepted adapter plus implementation fixtures for reconciliation — verifies that stable identity and representation evidence survive the actual transport. · B) Ship without that evidence and disclose recovery as experimental — leaves an essential delivery claim unverified. Recommended: A), because source inspection cannot establish a remote acknowledgment lost in transit. Default if unanswered: A); no exactly-once claim or successful reconciliation result is inferred from the read-only spike.

Owner's answer: A)

Decision: 826-lost-response-recovery-evidence

### Question 5

**Lifecycle persistence evidence:** Bootstrap/adoption and terminal ownership are specified above, but the spike could not execute mechanisms that do not yet exist. Options: A) Require implementation fixtures covering restart before/after adoption, auto worktree transfer, post-close acknowledgment loss, session/worktree cleanup and fresh-clone reconciliation — validates the selected lifecycle without implementing it during design. · B) Drop persistence across those edges — reduces work but invalidates the proposed retry/resume outcome. Recommended: A), because deterministic source and receipt ownership are necessary for the accepted resume behavior. Default if unanswered: A); the lifecycle remains unproven until those fixtures exercise the implementation.

Owner's answer: A)

Decision: 826-lifecycle-persistence-fixtures

### Question 6

**Source loss / cross-machine concurrency:** Durable artifacts cover committed state, while another machine can act on stale uncommitted state and no local lock coordinates it. Options: A) Require one active publisher per invocation and roll over on missing source or conflicting revision evidence — fits the CLI workflow model. · B) Add a shared remote coordination service — expands deployment and ownership substantially. Recommended: A). Default if unanswered: A); report conflicts and never overwrite uncertain foreign revisions.

Owner's answer: A)

Decision: 826-single-active-publisher

### Additional owner clarification — controlling delivery rule

Owner's answer:

whatever we do - we should use best effort to post the comment in the last comment and if that fails just post as new comment but whatever happens the workflow cannot fail because of commenting issues, one or two lost comments is not a big deal, just log friction.jsonl and move on

we on the same page?

Decision: 826-commenting-best-effort-never-fails-workflow

This later answer controls wherever earlier delivery guarantees conflict. The fallback edits only an eligible engine-owned progress comment, never a human comment. Comment failures and failure-recording errors do not fail or block the workflow.

### Current request — human checkbox authorization

Owner's request:

ask me any open questions one by one and then tick the human checkboxes

Decision: none

All six recorded questions are already answered, and the controlling clarification leaves no unanswered owner question in the current design or updated plan. The request authorizes the orchestrator to tick the human confirmation checkboxes after verifying the answer application. Implementation, provider evidence and automated execution boxes remain separate verification work.
