Verdict: CONCERNS
Failures: 1
Redesign: false

<!-- verdict:end -->

# Plan Review

Lens: Tightness — task dependency order, design-coverage.

The Narrative and five Success Criteria match the source design. All six workstreams have task owners: WS-1 → Tasks 1/2; WS-2 → Tasks 3/8/13; WS-3 → Tasks 4/5/13; WS-4 → Tasks 6/7/8; WS-5 → Tasks 9/10/14; WS-6 → Tasks 11/12/13/14. The five owner questions, no-host-write acquisition constraint, lowercase trailer and capability completion gates survive. No required work is parked out of scope, and no task adds a source-unjustified feature.

The consumed-artifact graph is 1 → 2/3; 2/3 → 4; 3/4 → 5; 2/5 → 6; 3/6 → 7; 7 → 8; 3 → 9; 8/9 → 10; 2/7 → 11; 8/10/11 → 12; 5/6/8/11/12 → 13; 10/12 → 14. Existing files supply the remaining inputs. One implicit producer is assigned after its consumer, as detailed below. Moving that responsibility resolves the ordering without changing the design. No irreducible cycle or separate cross-group test hand-off was found.

## CRITICAL

1. **Produce effective installed-model resolution before the lifecycle task consumes it (plan edit).** Task 7 requires real lifecycle fixtures to persist effective pre-spawn configuration, including invocation overrides, and its `snapshots effective dispatch configuration and explicit return boundaries` test fails when overrides are ignored. However, the implementation that resolves the installed role/configuration plus invocation overrides is assigned to `render/models.ts` in Task 8, which itself depends on Task 7. Task 7's file list covers only lifecycle commands, completed steps and lifecycle tests. As written, the implementer must leave Task 7's completion criterion unsatisfied until Task 8 or silently take over Task 8's source work. Move the effective-model resolver change and its own behavioral tests into Task 7 or an earlier producer task, then let Task 8 consume that existing interface while wiring the host renders and spawn instructions. Update `DEPENDS ON`, the test matrix and task file ownership consistently. Do not solve this by weakening Task 7's override/configuration assertion or adding a reverse dependency that creates a cycle. Evidence: `plan-v1-draft.md` Tasks 7/8; source design § Checkpoints and dispatch configuration and WS-4 require configuration to be resolved at the actual dispatch boundary.

## OPTIONAL

1. **Make the final capability-documentation pass explicit.** Task 12 writes proven/unsupported provider capabilities and calls its mirror refresh final, while Tasks 13/14 obtain the actual host and remote proof afterward. State whether those later tasks only confirm already established proof, or move the final capability documentation/mirror check after them. If a proof enables or disproves a route, name the earlier source owner and repeat the affected checks before the final documentation pass. This preserves the current gates and avoids documentation that still describes an implementation route as unverified after its proof succeeds.
2. **Name the actual leaf command boundary in the commit-surface inventory.** Task 10 reads `bkit-build-plan-tasks.md`, whose leaf does not commit, but the existing `bkit-ship-conflict-resolve.md` invokes `branches sync --merge`, an operation that commits the merge when resolution completes (lines 64-76 and 102-104). Include that prompt invocation explicitly in the host-context transport audit, or explain how the existing command boundary establishes the current leaf invocation without new prompt input. The design includes direct/leaf operations and replay/resolution; the broad Task 10 completion condition already covers the outcome, but the concrete source inventory should point at this path.
3. **Preserve the hook transport lessons during Task 8.** The folded active knowledge rows `kn-hooks-sessionstart-stdout-is-one-json-document` and `hook-driver-below-bkit-end-is-consumer-owned-so-install-never-updates-it` are relevant. Any added receipt handoff must preserve the single native output document and must be tested on an existing install as well as Task 12's fresh consumer. A template-only edit below a managed marker is not evidence that the installed host receives it; any required migration still needs the repository's explicit authorization.

## OUT OF SCOPE

None proposed as new implementation scope. Keep run-cost accounting, launcher cleanup, retrospective correlation and historical commit rewriting outside this plan, as the source design already specifies.

## SUGGESTED SCOPE EXPANSION

The related-issue artifact contains `None.`; it identifies no new blocker. The failure artifact is explicitly clamped to 7 of 21 matching rows, so the other 14 were not supplied and are not treated as reviewed or absent. These candidates are advisory only and should not become runbook tasks without a separate owner decision:

- **Codex Cloud session-start guard** — `related-deferrals.md`, key `719-codex-cloud-session-start-guard`. It overlaps the Codex cloud hook/entrypoint proof. Share sanitized capability evidence where useful, but leave tracker guard behavior to its existing work item.
- **Local/cloud workflow-close verification** — `related-deferrals.md`, key `341-live-run-verification-mode-1-and-mode-3`. It overlaps the actual lifecycle/remote close exercises. Reuse evidence when it proves that item's exact boundary; do not treat a host attribution proof as proof of all close behavior.
- **Provider rule auto-loading** — `related-deferrals.md`, key `700-provider-auto-load-rules`. It overlaps host configuration and context delivery. Keep separate from attribution; no new rule-loading behavior is required here.
- **First-action rule-read gate** — `related-deferrals.md`, key `700-first-action-deny-gate`. It overlaps per-session/per-tool native hooks. Reuse verified native hook facts, but do not add deny behavior to the attribution transport.
- **Rule-content acknowledgement** — `related-deferrals.md`, key `700-rules-content-hash-acknowledgement`. It overlaps session identity and receipt handling. Keep a rule-read acknowledgement distinct from proof of the current caller.
- **Host hooks for raw test runners** — `related-deferrals.md`, key `724-host-hook-catches-raw-test-runners`. It overlaps tool-hook changes and the native capability matrix. Keep command rewriting and machine-wide test locking separate.
- **OpenCode guardrails plugin and Codex read-tool wiring** — `related-deferrals.md`, keys `opencode-has-no-script-hook-so-two-gates-are-inexpressible-there` and `codex-read-tier-gates-not-wired-file-read-tool-name-unverified`. Their native tool contracts may inform the capability inventory; keep permission enforcement outside this feature.
- **Cursor hook diagnostics** — `related-deferrals.md`, key `381-cursor-hook-ask-rate-signal`. It overlaps safe hook diagnostics, but permission-ask measurement remains a separate feature.
- **Prompt-controlled publish override and self-resettable dispatch count** — `related-deferrals.md`, keys `715-retire-lite-workflows-challenge-low-bkit-core-engine-commands-workflow-status-ts-269` and `363-dev-dispatch-cap-self-resettable-by-controlled-principal`. They touch status/publication surfaces that this plan visits. Preserve current publication gates; changing their authority is separate work.
- **CI command timeout failures under concurrent audit load** — `related-failures.md`, keys `runs-test-ci-refuses-not-open-pr-timeout-under-full-suite`, `runs-context-issue-less-timeout-under-audits`, `runs-context-label-read-timeout-under-audits`, `runs-revalidate-pr-head-auth-timeout-under-audits` and `ci-scripts-resolve-push-base-standalone-test-timeout-under-full-gate`. They overlap the command/gate suites exercised by the commit work. Retain them as test-run context; do not weaken timeouts or assertions as part of this attribution plan.
