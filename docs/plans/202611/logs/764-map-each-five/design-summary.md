Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Design Summary

## Verdict

CONCERNS

- design-review CONCERNS

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| design-start-workflow | - | - | 1 | - |
| design-worktree-setup | - | - | 1 | `docs/plans/202611/logs/764-map-each-five/design-input-1.md` |
| design-grill | - | - | 1 | `docs/plans/202611/logs/764-map-each-five/design-grill-1.md`, `docs/plans/202611/logs/764-map-each-five/design-input-1.md` |
| design-brainstorm-ideate | - | - | 1 | `docs/plans/202611/logs/764-map-each-five/design-brainstorm-ideate-1.md`, `docs/plans/202611/logs/764-map-each-five/design-brainstorm-ideate-2.md`, `docs/plans/202611/logs/764-map-each-five/design-brainstorm-ideate-3.md` |
| design-generate | - | - | 1 | `docs/plans/202611/logs/764-map-each-five/design-v1-draft.md` |
| design-review | CONCERNS | - | 1 | `docs/plans/202611/logs/764-map-each-five/design-review-1.md`, `docs/plans/202611/logs/764-map-each-five/design-review-2.md` |
| design-apply-review | PASS | - | 1 | `docs/plans/202611/logs/764-map-each-five/design-v2-reviewed.md` |
| design-organise | PASS | - | 1 | `docs/plans/202611/logs/764-map-each-five/design-v3-organised.md` |

## Suggested Plans

### P-1: Reconcile written safety limits with current controls

Covers: WS-1 (Reconcile written limits and operational descriptions)
Requires: []

### P-2: Approve ordinary pushes with a scoped workflow exception

Covers: WS-2 (Validate the ordinary-push approval capability), WS-3 (Protect supported ordinary-push routes)
Requires: []

### P-3: Enforce shared-target force and push-hook safety

Covers: WS-4 (Enforce unconditional push safety)
Requires: []

### P-4: Reject secrets in covered candidate commits

Covers: WS-5 (Protect the final candidate commit snapshot)
Requires: []

### P-5: Check secrets in bkit-owned outgoing payloads

Covers: WS-6 (Protect bkit-owned outgoing publication payloads)
Requires: []


## Open Questions

- No new owner policy question is needed to complete this design. Q1-Q4 are settled. Live-host compatibility, reliable authorization channels and detector behavior are implementation evidence requirements for the separate proposals.
- G1's automatic exception depends on an owner-controlled channel bound to the actual push. An agent-created ticket, lock, env flag or status row is insufficient. Without that route, document the limitation and supported explicit approval path.
- G2 resolves actual remote/destination refs before granting lease exceptions. The existing bkit push route avoids force on shared branches but does not globally enforce the policy.
- Current fail-open hooks and disabled/untrusted project layers limit every source classification; no protection is promised in those conditions.
- Changes to a cited rule, shared classifier, permission table, host adapter, registration/trust prerequisite or auto-approval mode trigger review of the affected evidence-map claims. Consumer drivers and host upgrades can invalidate evidence. Downgrade stale claims to unverified until rechecked; no scheduler or generated policy catalog is required.
- G3/G4 do not guarantee universal staging/output secrecy or PII protection. Passing a scanner does not authorize publication that otherwise needs approval.
- Parsed validation is route- and timing-specific. Direct edits/tracker writes can bypass it; pre-commit validation cannot protect an earlier working-tree read.

## Risks and Action Items

None

## Recommended Next Step

```text
File the Suggested Plans issues, then /bkit-plan <first root plan's new issue>
```

Or, to address the reasons first: `/bkit-design #764`
