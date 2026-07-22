Verdict: PASS
Failures: 0

<!-- verdict:end -->

# Plan Review

Lens: Tightness, scope discipline, design-coverage.

## CRITICAL

None.

Template compliance, design-coverage, and scope discipline all hold:

- **Template §-completeness:** every `docs/plans/template.md` mandated section is present and populated — Context & Goals, Acceptance Scenario (Narrative / Success Criteria / Process Sketch / Concrete Example / Edge Cases / Derived Test Matrix), Breaking Changes, Open Questions & Assumptions, Alternative Approaches, Out of Scope, Suggested Scope Expansion, Security & Privacy, Pre-Flight + Gate 1, Data Schema Integration, Architecture & Component Changes, Supersession Inventory, Documentation Updates, Rollback, Agent Execution Runbook + Gates 2/3, Verification Plan + Gate 4, Merge Method. The 👤 human-confirmation checkboxes and all four gates are intact.
- **Acceptance Scenario / Derived Test Matrix are concrete, not vague:** 7 inherited Success Criteria, a numbered Concrete Example, a 10-row Edge Cases table, and a 15-row Derived Test Matrix where each row carries a real target file + tier and maps to exactly one task (rows 1–4→T3, 5–6→T7, 7–9→T9, 10→T4, 11→T1, 12→T12, 13→T5, 14–15→T16). The matrix honestly marks the only un-CI-testable behaviour (`@live` row 14, WS-16) rather than faking a proxy.
- **Success-criterion coverage:** SC1→T16(row14); SC2→T9(row9,D23); SC3→T9(row7,D24)+manual CI-dispatch check; SC4→T14+T9(row8,D25); SC5→T14(D12); SC6→T3(row3,Flow 1); SC7→T7(row5,D22). No orphan criterion.
- **Design-coverage:** all 16 design workstreams map — WS-1/2/3 (Spikes A/B/C) folded as CLOSED per `design-addendum-spikes.md`; WS-4→T2, WS-5→T1, WS-6→T3, WS-7→T6, WS-8→T7, WS-9→T8, WS-10→T9, WS-11→T10, WS-12→T11, WS-13→T13 (+ §6d prerequisite T12), WS-14→T14, WS-15→T15, WS-16→T16. Decisions D1–D26, Risks 1–9, and the three new `status.jsonl` row types all trace into tasks. The `[!CAUTION] build must not proceed on §6` gate (D26) is resolved through the addendum's C1/C2, folded into T4/T5/T14.
- **Done-when discipline:** every runbook task T1–T16 carries a `Done when:` with a codebase-verifiable criterion (file exists / test passes / observable behaviour). T15 is the softest but still names concrete verifiable parts.
- **Scope discipline:** all 8 Out-of-Scope rows are genuinely `Exempt` with a deferral/failure home; none is required by a Success Criterion, matrix row, or design section, so none is a Blocking deferral. No plan task lacks a source justification — nothing is invented beyond §6 / the design decisions / the spike addendum.

## OPTIONAL

- **T14 centrepiece is authored on provisional MCP tool names, only confirmed at the terminal task.** The §6c `mcp__github__*` map resolves only for `.mcp.json`'s `github` server; C2 defers "which server + which names" (proxy-brokered built-in vs `.mcp.json`) to the first live mode-3 session (T16). So the fallback lane's actual correctness is unverifiable until the last task, and a live surprise forces post-T16 rework. This is the design's own CONCERNS-verdict residual (accepted, "safe either way"), not plan drift — but consider adding a contingency clause to T14's `Done when` (e.g. "map re-pointed if T16 finds the built-in server uses different names") so the residual is tracked rather than silently assumed closed.
- **T15 peripherals have no dedicated Derived Test Matrix row.** The `bkit-worktree-{prune,sync}` self-skip and the debug-egress loudness fix rest only on the presence-grep prose audit (row 15) + the live run (row 14). The `CAN_WORKTREE` self-skip is bash-expressible and cheap to discriminate with its own `tests/*.bats` assertion; resting a real behaviour on presence+live is weaker than the shim's own tier allows.
- **T15 Playwright seam (OQ-B) sequencing.** "Verify `download_workflow_run_artifact` output shape at build against a real run" needs a real run, which only exists in T16 (terminal). In practice this verification slips to T16; fine as long as `get_job_logs` is the standing default until then — worth stating that default explicitly in T15.
- **OQ-A (D5 vs D5(a)) leaves the runbook shape conditional on a human decision.** The plan is fully written for D5(a) (PR-close) with T12 as a prerequisite and a documented D5 swap. This is transparent, but T12 and Derived Test Matrix row 12 vanish if the human picks D5 — a mid-build matrix mutation. Recommend the human resolve OQ-A explicitly at Gate 1 before build starts, not lazily during T13.
- **`failures.jsonl` remediation (1) — design Step 3.1 `0 hits -> None.`** is covered only at the doctrine layer by the `rules.md` "empty MCP read is inconclusive" invariant (T6), not by an explicit Step-3.1 rule rewrite. Confirm that invariant actually reaches the design subagent's Step-3.1 behaviour (it is a subagent-read rule, and this run's own `related-issues.md` shows the silent-zero still fires) — otherwise the corroboration guarantee is prose-adjacent rather than wired into the one call site that produced the logged failure.

## OUT OF SCOPE

- No plan-expansion suggestions beyond what the plan already parks. The two `related-deferrals.md` entries (runtime-4 Cursor first-class detection; periodic transport-fallback summariser) and the `related-failures.md` entry (search_issues silent-zero root cause) are each already captured in the plan's Out of Scope table with correct deferral/failure homes — no pullback needed.

## SUGGESTED SCOPE EXPANSION

- shellcheck gate over `.bkit/scripts/*.sh` — `docs/deferrals.jsonl` `58-no-shellcheck-gate-over-bkit-scripts` — overlaps the new `.bkit/scripts/bkit-runtime.sh` (ships un-shellchecked like its siblings) — **needs a decision** (a `shellcheck -s sh` static step would also cover the new shim; the plan already surfaces this in its own Suggested Scope Expansion). Advisory only.
- Prompt-injection / lethal-trifecta hardening — `#342` (open) — overlaps §6f + every extra MCP call in T14 — **keep deferred** (#342 owns it; T14's D13 max-1 bound is the real mitigation here, do not duplicate).
- `status.jsonl` run-boundary interleave hazard — `docs/deferrals.jsonl` `58-status-jsonl-run-boundary-keys-on-last-run-overall` — overlaps the new row types riding the same ledger — **keep deferred** (owned by #209's status substrate, not this runtime change).
