Verdict: CONCERNS
Failures: 4
Redesign: false

<!-- verdict:end -->

# Plan Review

Lens: Regression risk — touched surfaces, backwards compatibility, design-coverage.

## Surface-Area Map

<!-- prettier-ignore -->
| Task | Touched surface and consumers | Risk and coverage |
| --- | --- | --- |
| 1 | `guardrails-shell.js` lexical helpers and `shellEditTargets`; `guardrails-tiers.js`; rendered Claude, Cursor, Codex and Antigravity shell hooks | High-risk shared parser and result contract. Direct-command matrix exists, but the direct Claude caller is not updated in the same group; R1. |
| 2 | Shared detector reads inline and directly named Python/Node/patch source | High-risk untrusted-input and filesystem boundary. Matrix covers literal, uncertain and positive read-only cases without executing source. |
| 3 | Bounded filesystem inspection and shared enforcement classification | High-risk shared utility. Descriptor, limit, stronger-decision and compound-command rows cover the intended additions. |
| 4 | `gateguard-engine.js` formatters, path identity and temporary warning state; every edit adapter | High-risk shared state. Isolated preparation and identity rows are appropriate, provided actual module isolation is used as the plan states. |
| 5 | Shared selection, budgets, acknowledgement, modes and state fallback | High-risk delivery/state contract. Generic unit coverage does not exercise the separate Antigravity retry store; R3. |
| 6 | Claude managed hooks, common edit payload and settings matcher | Notebook and shell integration row covers new registration and extraction. Existing pure entry points and response contract are preserved. |
| 7 | Cursor managed hooks, common edit payload and hooks matcher | Delete/shell row and explicit outer-driver limitation address the known ownership boundary. |
| 8 | Codex patch extraction and shell bridge | New complete-patch and initial-shell integration row discriminates against the current first-target-only implementation. |
| 9 | Antigravity matcher/adapter and OpenCode plugin consumers of shared advice | High-risk host delivery. Antigravity silent-allow acknowledgement needs a boundary case; OpenCode preservation is already implemented and cannot supply the stated red test; R2–R3. |
| 10 | Shared rules, 36 template editor notes, canonical provider/workflow docs and testing guidance | Source-contract test covers the new pointers. No public API, database or migration changes. |
| 11 | Existing render/install modules through fresh and upgrade consumer tests | Real filesystem integration is appropriate; preserve actual old outer drivers rather than construct an upgrade fixture from the new template. |
| 12 | Rendered parity and timing/size evidence | Cross-adapter coverage is useful. Existing load-dependent failures in the exact test surface need acknowledgement; R4. |

The reviewed input preserves the accepted design's conservative budgets, no-new-shell-blocking decision, explicit live-delivery uncertainty and consumer ownership. No database, event topic, public endpoint or durable schema is introduced.

Review limits: Serena rejected the ignored worktree path, so references were traced with scoped text reads. The plan, relevant design/input sections, selected existing hook implementations and test harnesses, and folded relevant ledger entries were inspected. Bulk related-issue and ledger output was truncated; the complete historical related-issue corpus was not read. The supplied related-failures artifact itself retained only 2 of 15 matching entries; relevant winning rows were read directly from `docs/failures.jsonl`. No tests or live host probes were run for this plan review. The input's historical instruction to open probe workspaces and run synthetic experiments was treated as evidence, not executed.

## CRITICAL

### R1 — Update the direct shell-result consumer with the contract change (plan edit)

Task 1 replaces the description array returned by `shellEditTargets` with structured evidence, but updates only `guardrails-shell.js` and `guardrails-tiers.js`. Claude bypasses the tier classifier: `.bkit/core/.claude/hooks/bkit-guardrails.cjs:65` calls the detector directly and line 66 gates advice on `edits.length`. An object result has no array length, so Claude silently loses shell-edit advice after group 1. Task 6 does not update this consumer until group 2. This conflicts with group 1's requirement to keep existing enforcement/advisory tests passing and with the design's instruction to update all callers together. Move the minimal direct-consumer adaptation and its regression check into the contract-changing group, or retain a deliberate compatible interface until all consumers switch. The final design needs no change.

### R2 — Give the OpenCode logic change a discriminating test (plan edit)

Task 9's `preserves OpenCode edit coverage and after-execute boundary` test is specified to fail on losing existing patch targets or implying shell/before-edit coverage. Those assertions already pass: `.bkit/core/.opencode/plugin/bkit-gateguard.js:111` parses all add/update/delete/move targets; `advisoryFor` at line 182 iterates them; `EDIT_TOOLS` at line 57 excludes shell tools; the V1/V2 after hooks deliver the advisory. Existing tests beginning at `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts:634` already exercise every patch target in both driver versions, and the preceding shell case asserts no advice. Keep these preservation checks as regression coverage, and specify a new failing assertion tied to the planned change, such as path-identity or preparation/acknowledgement behavior through the real OpenCode driver. Assign that assertion to the task/group that introduces the behavior and use Integration if it exercises the wired driver plus shared engine. Do not invent a red by asserting behavior the design excludes.

### R3 — Test acknowledgement after Antigravity transport acceptance (plan edit)

The plan tests warning-state failure inside the shared engine, but Antigravity has another stateful delivery boundary. `.bkit/core/.agents/plugins/bkit/hooks/bkit-gateguard.cjs:77` currently calls `firstTouchAdvice` before `adviseOnce` at line 79. The latter returns a bare allow both for an identical retry (`.bkit/core/hooks/antigravity-hook.js:72`) and when its retry-store write fails (line 77). A route being generally verified does not mean this particular block was delivered. Retaining this order after shared preparation/selection can acknowledge a path whose advice was silently dropped. Add an explicit Antigravity integration case with a real unavailable retry-state location: the hook allows under its existing fail-open contract, the target remains unacknowledged, and a later deliverable call can still warn. Task 9 should commit acknowledgement only after a complete selected block is accepted by the existing transport. Preserve the established deny-once mechanism and do not introduce a new denial policy.

### R4 — Acknowledge the known load-dependent failure in the expanded suite (plan edit)

Tasks 4–5 and 9 add work to `gateguard-opencode.test.ts`, but the plan does not acknowledge its known failing parallel-load pattern. The latest winning row at `docs/failures.jsonl:162`, key `gateguard-opencode-patch-tests-flaky-under-full-audits-run`, is TRIAGED and records patch/deny cases that fail under the full run and pass alone. Its diagnosed cause is a lagging load-average-derived timeout budget. Add this known failure to the plan's test risks and verification procedure; use bounded isolated fixtures for new module cases and record full-suite failures without calling a passing retry proof of success. Keep unrelated global timeout-policy changes separate unless the implementation demonstrates they are required. The new hard cold-start measurement should state its controlled measurement conditions so scheduler contention is not silently mistaken for detector cost.

## OPTIONAL

The shared scanner, warning identity, managed hook entry points and consumer-owned drivers are high-risk surfaces even after the findings above are fixed. Preserve the plan's real rendered-hook and fresh/upgrade checks. In upgrade fixtures, retain a byte-for-byte old outer driver and custom registration group, then assert new managed behavior and unchanged owned bytes. This directly exercises the known `hook-driver-below-bkit-end-is-consumer-owned-so-install-never-updates-it` boundary.

Keep the Antigravity retry signature hashed when extending its use. The supplied deferral records the prior cleartext tool-argument exposure as closed; the current `adviseOnce` hashes at `.bkit/core/hooks/antigravity-hook.js:67`. A command-bearing fixture should verify that no raw command enters either state store.

## OUT OF SCOPE

New OpenCode shell interception, Codex read-tool registration, a driver migration, live model-delivery probes and global test-timeout policy are separate work. The accepted design expressly retains the current delivery limitations; this review does not make those limitations new blockers or authorize the historical probe instructions.
