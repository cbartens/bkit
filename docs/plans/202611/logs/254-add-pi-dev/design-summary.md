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
| design-worktree-setup | - | - | 1 | `docs/plans/202611/logs/254-add-pi-dev/design-input-1.md` |
| design-grill | - | - | 1 | `docs/plans/202611/logs/254-add-pi-dev/design-grill-1.md`, `docs/plans/202611/logs/254-add-pi-dev/design-input-1.md` |
| design-brainstorm-ideate | - | - | 1 | `docs/plans/202611/logs/254-add-pi-dev/design-brainstorm-ideate-1.md`, `docs/plans/202611/logs/254-add-pi-dev/design-brainstorm-ideate-2.md`, `docs/plans/202611/logs/254-add-pi-dev/design-brainstorm-ideate-3.md` |
| design-generate | - | - | 1 | `docs/plans/202611/logs/254-add-pi-dev/design-v1-draft.md` |
| design-review | CONCERNS | - | 1 | `docs/plans/202611/logs/254-add-pi-dev/design-review-1.md`, `docs/plans/202611/logs/254-add-pi-dev/design-review-2.md` |
| design-spike | FAIL | - | 1 | `docs/plans/202611/logs/254-add-pi-dev/design-spike.md` |
| design-apply-review | PASS | - | 1 | `docs/plans/202611/logs/254-add-pi-dev/design-v2-reviewed.md` |
| design-organise | PASS | - | 1 | `docs/plans/202611/logs/254-add-pi-dev/design-v3-organised.md` |

## Resolved Findings

- design-review CONCERNS, resolved by design-apply-review

## Reassessed Findings

- design-spike: design impact addressed by design-apply-review; unsettled claims remain

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| design-start-workflow | - | - | - |
| design-worktree-setup | - | - | `docs/plans/202611/logs/254-add-pi-dev/design-input-1.md` |
| design-grill | - | 1 | `docs/plans/202611/logs/254-add-pi-dev/design-grill-1.md`, `docs/plans/202611/logs/254-add-pi-dev/design-input-1.md` |
| design-brainstorm-ideate | - | 1 | `docs/plans/202611/logs/254-add-pi-dev/design-brainstorm-ideate-1.md`, `docs/plans/202611/logs/254-add-pi-dev/design-brainstorm-ideate-2.md`, `docs/plans/202611/logs/254-add-pi-dev/design-brainstorm-ideate-3.md` |
| design-generate | - | 1 | `docs/plans/202611/logs/254-add-pi-dev/design-v1-draft.md` |
| design-review | CONCERNS | 1 | `docs/plans/202611/logs/254-add-pi-dev/design-review-1.md`, `docs/plans/202611/logs/254-add-pi-dev/design-review-2.md` |
| design-spike | FAIL | 1 | `docs/plans/202611/logs/254-add-pi-dev/design-spike.md` |
| design-apply-review | PASS | 1 | `docs/plans/202611/logs/254-add-pi-dev/design-v2-reviewed.md` |
| design-organise | PASS | 1 | `docs/plans/202611/logs/254-add-pi-dev/design-v3-organised.md` |

## Suggested Plans

### P-1: Complete Pi workflow support

Covers: WS-1 (Pi installation and configuration), WS-2 (Process containment and worktree recovery), WS-3 (Managed entry and runtime safeguards), WS-4 (Tracker and research tools), WS-5 (Delegation and workflow evidence), WS-6 (Compatibility and release evidence)
Requires: []


## Open Questions

- **Mixed installations.** The exact Codex exclusion and explicit Pi skill invocation worked through reload in a checkout and linked worktree on Pi 1.5.0. Repeat with the shipped assets and both install orders. [Pi skills discovery](https://pi.dev/docs/latest/skills).
- **Failure evidence.** A readiness refusal, policy mismatch, invalid artifact or uncertain cleanup blocks the applicable operation with its own reason. Failure to persist the diagnostic is independently visible. Resume keeps an unresolved cleanup lease active.
- **Compatibility scope.** The design may progress with identified runtime unknowns. Release requires live evidence for the complete scoped integration and a version-bound compatibility record. The public harness leaderboard is motivation. A bkit cost claim needs a controlled full-workflow comparison.

### Startup proof (S1)

Which route should the build use to prove refusal before a provider request and a workflow mutation when the guard is missing or broken? The loaded refusal handler exited before provider hooks in TUI, JSON and print. Missing-guard behavior remains unverified.

Options: A) Require the managed CLI entry and RPC handshake to pass both sentinels — preserves the chosen subprocess route and holds support until it is proved · B) Evaluate a separate SDK worker when the CLI proof fails — adds integration work and keeps the same sentinels.

Recommended: A) Prove the selected route first. Revisit the SDK only if the required mechanism is disproved.

Default if unanswered: A).

### Tool reach (S2)

How should the build handle unverified native MCP restrictions? The spike observed a restricted tool list with MCP disabled. It did not exercise an actual forbidden call or an allowed subset.

Options: A) Verify the guarded native route against a real MCP fixture — retains the current tracker fallback and requires foreign-extension, direct, indirect and nested-delegation negatives · B) Investigate a narrow adapter that publishes only explicit tracker calls if native restrictions fail — adds a translation surface and requires the same denial and tracker parity tests.

Recommended: A) Prove the native route with a positive control for an allowed call and negative controls for the others.

Default if unanswered: A). Withhold support for any affected route until it passes.

### Alternate provider evidence (S3)

Which non-default provider should be the first live override fixture? The spike verified all three OpenRouter default pairs. The results show Pi's effective thinking settings and real tool calls. They do not measure provider-internal reasoning.

Options: A) Use the first credentialed alternate Pi provider with a complete persona model mapping — minimizes setup and proves configurable selection with an explicit override · B) Name one specific alternate provider before planning the probe — targets the owner's preferred setup and may require provisioning.

Recommended: A) Validate the resolver with one real alternate and limit the advertised matrix to tested combinations.

Default if unanswered: A). Alternate provider support stays unverified until an authenticated tool call passes through bkit's resolver.

### Descendant containment (S5)

Should release wait for native macOS containment proof or certify each platform independently? Pi's own process group did not contain its shell descendant in the macOS spike.

Options: A) Certify each platform only after its own containment and recovery tests pass — allows verified platforms to proceed while retaining every workflow requirement · B) Require macOS containment proof before releasing any platform — prioritizes a common release and may delay all Pi support.

Recommended: A) The cleanup guarantee is platform-specific. Preserve the unresolved lease on every platform until cleanup can be proved.

Default if unanswered: A). A platform without proved containment stays unsupported for workflow execution.

### Owner decisions in local non-interactive mode (S6)

Should local sessions without a human answer channel use the existing headless decision policy or wait for an explicit caller integration? The spike showed Pi JSON and print expose no UI while the current engine classified local execution as interactive.

Options: A) Report the verified channel capability independently and apply current headless decision rules — permits safe automation and blocks or defers unresolved required decisions · B) Add and verify an explicit external owner answer channel before allowing non-interactive decisions — supports remote answers and adds protocol and authorization work.

Recommended: A) Reuse the existing decision policy and verify both the interactive and blocked paths without changing worktree or push capabilities.

Default if unanswered: A).

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-plan #254
```

Or, to address the reasons first: `/bkit-design #254`
