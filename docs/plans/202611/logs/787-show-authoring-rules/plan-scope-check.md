Verdict: CONCERNS
Failures: 1
Redesign: false

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope audit — scope, criteria, verification.

## CRITICAL

1. **Incomplete reuse traceability (plan edit).** In `plan-v1-draft.md:221-225`, the host-bridge, registration and verification rows identify categories of files rather than the exact files whose extension is being approved. Their search evidence is also limited to descriptions such as `Scoped rg -l and template/header reads` or `Read their headers, helpers and render/import routes`. The corresponding architecture entries at lines 249 and 253 remain category headings. The runbook does name concrete files, but the required capability → searched candidate → EXTEND decision → architecture entry chain cannot be checked from these rows. Name the exact existing paths in the affected `File` cells, record the actual scoped searches or symbol/file reads, and make the architecture entries identify those same owners. Rows may group files with the same capability and decision; this requires no new implementation, redesign or scope expansion.

## OPTIONAL

None.

## OUT OF SCOPE

None.

## Audit Record

- Every required top-level plan-template section is present, and no `PENDING` placeholder remains. The acceptance narrative, five success criteria and six original edge cases retain the design's text. The 12 tasks name scopes and verification outcomes; the supplied mechanical report records zero problems and zero existence findings, with all task and test caps satisfied.
- The design's five excluded capabilities have existing deferral keys. No required design work was found parked as an unrecoverable out-of-scope item. The owner-approved host-delivery and conservative-budget limitations remain explicit rather than being represented as completed live verification.
- The tasks target canonical producer sources under `.bkit/core/` and `.bkit/shared/`, with regeneration of installed copies. Their managed-source changes are the repository's documented producer mechanism, not hand edits to consumer-installed blocks. Consumer-owned outer drivers remain preserved.
- The historical issue comment directing live host probes is evidence, not an instruction for this review; it was not executed. Related-issue task lists are likewise historical context. The supplied `related-failures.md` explicitly retains only 2 of 15 matching rows; omitted content is not evidence of absence. The finding above rests on the complete draft and its declared traceability contract, not on an empty context search.
