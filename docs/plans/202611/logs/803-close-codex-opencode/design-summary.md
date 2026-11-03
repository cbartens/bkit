Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Design Summary

## Verdict

CONCERNS

- design-spike: unsettled claims remain

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| design-start-workflow | - | - | 1 | - |
| design-worktree-setup | - | - | 1 | `docs/plans/202611/logs/803-close-codex-opencode/design-input-1.md` |
| design-grill | - | - | 1 | `docs/plans/202611/logs/803-close-codex-opencode/design-grill-1.md`, `docs/plans/202611/logs/803-close-codex-opencode/design-input-1.md` |
| design-brainstorm-ideate | - | - | 1 | `docs/plans/202611/logs/803-close-codex-opencode/design-brainstorm-ideate-1.md`, `docs/plans/202611/logs/803-close-codex-opencode/design-brainstorm-ideate-2.md`, `docs/plans/202611/logs/803-close-codex-opencode/design-brainstorm-ideate-3.md` |
| design-generate | - | - | 1 | `docs/plans/202611/logs/803-close-codex-opencode/design-v1-draft.md` |
| design-review | CONCERNS | - | 1 | `docs/plans/202611/logs/803-close-codex-opencode/design-review-1.md`, `docs/plans/202611/logs/803-close-codex-opencode/design-review-2.md` |
| design-spike | CONCERNS | - | 1 | `docs/plans/202611/logs/803-close-codex-opencode/design-spike.md` |
| design-apply-review | PASS | - | 1 | `docs/plans/202611/logs/803-close-codex-opencode/design-v2-reviewed.md` |
| design-organise | PASS | - | 1 | `docs/plans/202611/logs/803-close-codex-opencode/design-v3-organised.md` |

## Resolved Findings

- design-review CONCERNS, resolved by design-apply-review

## Reassessed Findings

- design-spike: design impact addressed by design-apply-review; unsettled claims remain

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| design-start-workflow | - | - | - |
| design-worktree-setup | - | - | `docs/plans/202611/logs/803-close-codex-opencode/design-input-1.md` |
| design-grill | - | 1 | `docs/plans/202611/logs/803-close-codex-opencode/design-grill-1.md`, `docs/plans/202611/logs/803-close-codex-opencode/design-input-1.md` |
| design-brainstorm-ideate | - | 1 | `docs/plans/202611/logs/803-close-codex-opencode/design-brainstorm-ideate-1.md`, `docs/plans/202611/logs/803-close-codex-opencode/design-brainstorm-ideate-2.md`, `docs/plans/202611/logs/803-close-codex-opencode/design-brainstorm-ideate-3.md` |
| design-generate | - | 1 | `docs/plans/202611/logs/803-close-codex-opencode/design-v1-draft.md` |
| design-review | CONCERNS | 1 | `docs/plans/202611/logs/803-close-codex-opencode/design-review-1.md`, `docs/plans/202611/logs/803-close-codex-opencode/design-review-2.md` |
| design-spike | CONCERNS | 1 | `docs/plans/202611/logs/803-close-codex-opencode/design-spike.md` |
| design-apply-review | PASS | 1 | `docs/plans/202611/logs/803-close-codex-opencode/design-v2-reviewed.md` |
| design-organise | PASS | 1 | `docs/plans/202611/logs/803-close-codex-opencode/design-v3-organised.md` |

## Suggested Plans

### P-1: Enforce Codex key reads and OpenCode download targets

Covers: WS-1 (Shared command findings and Codex key denial), WS-2 (OpenCode download enforcement and host delivery)
Requires: []

### P-2: Revoke owned grants with durable recovery

Covers: WS-3 (Durable permission ownership and mutation recovery), WS-4 (Grant reconciliation, uninstall and operator completion)
Requires: []

### P-3: Detect stale cloud baseline stamps

Covers: WS-5 (Cloud baseline stamps and copied-bootstrap rollout)
Requires: []


## Open Questions

- **Historic permission ownership requires an owner policy.** Some OpenCode entries have no record, and the current Claude enrichment returns the whole needed set rather than only entries it inserted. Exact historic authorship may therefore be unrecoverable. Options: A) Preserve unproven entries, report exact locations for owner review, and automate future revocation with provenance — protects user permissions but leaves historic cleanup requiring a decision. · B) Authorize an idempotent migration that removes exact former generated shapes — improves legacy cleanup but can delete identical user entries and requires explicit migration approval. Recommended: A) because it follows settled Q4 and does not manufacture ownership evidence. Default if unanswered: A); existing installs with unresolved entries must not be reported as fully cleaned.
- **OpenCode and Codex enforcement remain unproven (`S1`).** The spike found OpenCode 2.1.4 and Codex 0.165.0, but no configured default model, fresh trusted fixture, loaded-plugin test, executing positive control or repeated refusal. The cloud's OpenCode 2.1.2 pin is another candidate, and no exact V1 version is selected. Options: A) Select a concrete V1 version and verify every retained candidate row through real model tool sessions before relying on convenience allows — preserves intended host coverage but needs the missing session setup and binary. · B) Seek owner approval to restrict the changed behavior to versions actually proven and mark the rest unsupported — lowers validation scope but narrows provider support. Recommended: A) because provider parity is required. Default if unanswered: A); no row is certified by version discovery, and inability to prove enforcement blocks the affected host outcome.
- **The full download-client contract remains unproven (`S2`).** The spike measured four curl 8.7.1 cases, but GNU Wget and the completed lexical/option/authority profile were unavailable. Options: A) Complete the explicit profile and compare its accepted corpus with real curl and GNU Wget using local listeners before certifying their versions — preserves both requested clients and exposes grammar differences. · B) Seek owner approval to support only the proven client/profile and refuse the other — reduces validation work but narrows the requested behavior. Recommended: A) because both curl and wget are in scope. Default if unanswered: A); missing client evidence blocks the corresponding supported-download claim rather than allowing a simulated substitute.
- **Top-level hook exceptions remain fail-open under the existing policy.** Explicit parser uncertainty and unavailable allowlists produce ordinary refusal, but an unexpected internal hook crash can still bypass enforcement. Options: A) Preserve that existing availability trade-off with visible sanitized error reporting — limits this change to accepted policies. · B) Make recognized OpenCode shell calls fail closed on internal errors — stronger enforcement but can block legitimate work during hook defects. Recommended: A) because the interview did not approve changing the general crash contract. Default if unanswered: A), with the guarantee stated as enforcement when the hook operates.
- **Production recovery verification remains open after the primitive result (`S3`).** The local spike settled exclusive-create contention and before/after/third-hash classification after process exit. It did not exercise all installer state writers, stale-holder reclamation, permission finalization or partial uninstall. Options: A) Verify those integrated transitions and every interruption boundary under the stated local-filesystem contract — supports the proposed lock/journal without claiming power-loss guarantees. · B) Hold permission-lifecycle delivery until a supported environment can run that verification — delays delivery while preserving the same guarantee. Recommended: A) because the existing primitive evidence supports continuing with bounded integration validation. Default if unanswered: A); no primitive result substitutes for production recovery checks. Non-cooperating editors retain the disclosed check-to-write race.
- **Cloud stamps are an operator assertion.** A stamp can be copied without the matching network list. The status text states that limitation, and missing or mismatched evidence never blocks bootstrap. No dashboard-readback guarantee is made.
- **Copied or modified host drivers can remain stale.** The managed-part lifecycle cannot silently rewrite consumer-owned code around it. Installation must report required wiring changes and validate the rendered supported drivers; deployment instructions must cover old bootstrap copies.
- **Diagnostics can expose secrets.** Messages use reason categories, safe basenames or normalized hostnames. They omit complete shell commands, URL userinfo, query strings, request headers and file contents.

## Risks and Action Items

None

## Recommended Next Step

```text
File the Suggested Plans issues, then /bkit-plan <first root plan's new issue>
```

Or, to address the reasons first: `/bkit-design #803`
