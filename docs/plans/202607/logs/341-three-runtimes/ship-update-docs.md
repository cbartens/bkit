# Docs Update — 341-three-runtimes

**FID:** 341-three-runtimes · **YYYYMM:** 202607 · **PR:** #382 (squash merge `d64ef5b` → `dev`, 2026-07-28) · **Cycle:** Ship · **Parallel-run safe:** reads only `docs/`, does not touch implementation.

Sources re-read at session start: parent plan `341-three-runtimes-plan.md` + sub-plans 1–6, `ship-input.md`, `ship-deferred-sweep.md`, `status.jsonl`, `docs/deferrals.jsonl`, `git show d64ef5be` (post-merge diff stat), `.agents/docs.md`.

## Files Modified

- `docs/completed.md` — appended new entry `## Three-runtimes workflow execution — #341 (2026-07-28)` at EOF (Append-only rule per `.agents/docs.md`).

No other `docs/*.md` required edits — see Drift Resolved.

## Drift Resolved

### `docs/completed.md` — **Sync** pass

- **Gap closed:** No entry existed for the FID (last entry was `#261` 2026-06-16). Appended one entry covering: shipped mechanism (runtime shim + capability table), adopt-or-mint branch model, close-guard kernel D23/D24/D25, gh→MCP fallback lane, `bkit_wait_ci`, gh-preflight hardening, the 3 additive `status.jsonl` row types, test inventory, build-challenge F4 remediation, success-criteria discharge status, and the post-merge HUMAN live-run follow-up.
- **Reorganize:** N/A — append-only ledger, entry placed at canonical EOF.
- **Compress:** dense phrasing mirroring the existing entry cadence (2–4 dense sentences expanded to one fat `Summary` bullet, matching the multi-bullet precedent set by `#141`/`#245`/`#261`).
- **Cross-Reference:** `Summary` + `Related` carry inline pointers to `docs/deployments.md` § "Autonomous phase-close prerequisites", `docs/observability.md` § "Runtime capability row" + § "gh→MCP fallback lane + peripheral loudness", `docs/security.md` § "CI Auto-Route Trust" (FID slug allowlist), `docs/testing.md` § "Runtime shim + gh-preflight test coverage", `.bkit/workflows.md` (close-transport audit rows + local-byte-identity rule), and the parent issue/plan cross-FID graph (`#134`/`#209`/`#234`/`#342`/`#75`/`#261`/`#384`).

### `docs/deployments.md`, `docs/observability.md`, `docs/security.md`, `docs/testing.md`, `.bkit/workflows.md` — **no edit this turn**

All four canonical docs + `.bkit/workflows.md` were **already updated in the merged feature commit `d64ef5b`** (verified via `git show d64ef5be -- <file>`):

<!-- prettier-ignore -->
| Doc | Δ in PR #382 | Section landed |
| --- | --- | --- |
| `docs/deployments.md` | +9 | § "Autonomous phase-close prerequisites" (dev branch-protection + auto-delete-head-branches dependency, Exempt #11) |
| `docs/observability.md` | +14 | § "Runtime capability row" (`runtime-resolved` Step-2 emit, D21) + § "gh→MCP fallback lane + peripheral loudness" (`transport-fallback`/`close-transport`, worktree-helper self-skip, debug-egress loudness) |
| `docs/security.md` | +2 | § "CI Auto-Route Trust" — FID slug allowlist (build-challenge F4 remediation) |
| `docs/testing.md` | +21 | § "Runtime shim + gh-preflight test coverage" (bats/vitest inventory + `bkit_wait_ci` extraction + `BKIT_RUNTIME_SH`/`BKIT_CLOUD_BOOTSTRAP_SH` override convention) |
| `.bkit/workflows.md` | +15 | Runtime capability table invariants, local byte-identity rule, `[skip ci]` scope, design/plan-never-waits, adopt-mode push restrictions, Ship Step 9 carve-out, 3 close-transport audit row shapes |

Sync pass: no gap vs shipped code. Reorganize pass: no duplication found (each doc owns a distinct facet per `.agents/docs.md` row scopes). Compress pass: prose already token-dense in the PR. Cross-Reference pass: inline pointers already present.

### `docs/architecture.md`, `docs/technology.md`, `docs/warnings.md`, `docs/setup.md` — **no edit needed**

- `architecture.md` describes system boundaries (CLI + agent-stack payload + producer/consumer layout). The runtime shim is operational/procedural logic, not a new component boundary — correctly lives in `docs/observability.md` + `docs/deployments.md` + `docs/testing.md`. Grep for `three-runtime\|bkit-runtime\|bkit_wait_ci\|RUNTIME_DEVPUSHES\|CAN_WORKTREE` returned no hits, confirming no stale state to sync.
- `technology.md` (framework/library choices) — no new framework shipped; shim is bash, already covered by the existing shell-tooling convention.
- `warnings.md` — no new intentional log-level downgrades introduced by this feature.
- `setup.md` — no new local-dev CLI or secret required (`GH_TOKEN`/`GH_BKIT_TOKEN` reuse per Security § C2).

### Excluded by protocol

- `docs/knowledge.jsonl` (+6 in PR) — excluded per contract.
- `docs/decisions.jsonl` (+3 in PR) — excluded per contract.
- `docs/failures.jsonl` (+3 in PR) + `docs/deferrals.jsonl` (+6 in PR) — append-only ledgers, populated by workflow steps not the docs-sync subagent.

## Pending Items

Open `docs/deferrals.jsonl` rows referencing `{FID}` = `341` (surfaced verbatim for HUMAN review — NOT written by this pass):

<!-- prettier-ignore -->
| # | key | status | severity | summary |
| --- | --- | --- | --- | --- |
| 1 | `shell-native-mcp-cli-bridge-real-exit-codes` | OPEN | MEDIUM | Thin CLI bridge returning real exit codes for gh→MCP fallback branches (bespoke CLI duplicating MCP auth/session semantics — minimal/additive principle rules out for this cycle) |
| 2 | `uniform-pr-based-phase-close-all-runtimes` | OPEN | MEDIUM | Make PR-based phase-close the single close path in all runtimes and delete the local squash-merge (regresses mode-1 offline/instant + collides with `[skip ci]` PR-title assert) |
| 3 | `tracker-read-path-corroboration-outside-mcp-private-repo` | OPEN | MEDIUM | Narrow read-only gh corroboration for `mcp__github__search_issues` silent-zero on private repos (D12 mitigates within MCP) |
| 4 | `341-periodic-transport-fallback-frequency-analysis` | OPEN | LOW | Periodic bkit-analysis pass summarising transport-fallback frequency against `GH_OK=false` runs (design OQ5 — new analysis feature, D25 gives the per-run reader) |
| 5 | `341-mode-tuned-subagent-fanout-concurrency-pacing` | OPEN | LOW | Mode-tuned concurrency pacing for subagent fan-out vs claude.ai shared-account rate budget ("revisit only if hit") |
| 6 | `341-t16-manual-verification-steps-1-4-require-live-sessions` | OPEN | MEDIUM | Manual Verification Steps 1–4 unreachable from non-interactive subagent (live sessions required) — see Handover |
| 7 | `341-fid-marker-path-traversal-validation-missing` | OPEN→CLOSED | LOW | Build-challenge F4 — RESOLVED: strict slug allowlists at all 4 `bkit-auto` FID exit points + `docs/security.md` doctrine + 39-case regression guard. Lifecycle tracked OPEN (`ts=1784860314478`) → CLOSED (`ts=1784865560347`) |
| 8 | `341-live-run-verification-mode-1-and-mode-3` | OPEN | MEDIUM | A real `/bkit-design`/`/bkit-plan` close has not been run on laptop (mode-1) or in a claude.ai cloud session (mode-3) since the close path was restructured — structural coverage Delivered, live e2e Exempt |
| 9 | `runtime-4-cursor-background-agent-first-class-detection` | CLOSED | MEDIUM | PROMOTED into scope 2026-07-23 — `CLOUD_CURSOR` row + `.bkit/.runtime-cursor` bridge delivered; live confirmation bundled with Manual Step 2 |
| 10 | `384-ship-redesign-sequence-after-341` | OPEN | MEDIUM | Cross-FID: sequence `#384` ship redesign AFTER `#341` lands, not folded in (would re-open the local-byte-identity question this PR closed) |
| 11 | `384-extract-ship-git-ci-mechanics-into-a-tested-kernel` | OPEN | LOW | Cross-FID (references `341`): promote remaining ship git/CI mechanics into `.bkit/scripts` after `#384` lands |

**Handover note for HUMAN (items 6, 8, + Manual Steps 1–4):** before final release confidence, run (1) one real `/bkit-design` or `/bkit-plan` cycle on the laptop confirming `docs({FID}): {phase} DONE bkit [skip ci]` lands on `dev` with no CI run dispatched and the `runtime-resolved`/`close-transport` status rows; (2) the same from a claude.ai cloud session confirming adopt-mode worktree skip, no `git checkout dev`, and the three named live residuals (sleep block-vs-error, in-sandbox MCP server + `GH_BKIT_TOKEN`, `push_files`/PR-close reject-vs-clobber); (3) a CI event/label dispatch confirming `RUNTIME=GITHUB_ACTION` (byte-identical to mode-1 — asserted in `tests/bkit-runtime.bats`); (4) Cursor Cloud Agent detection-var + sleep-block live confirmation; (5) `dev` branch-protection/auto-delete-head-branches dashboard re-confirm (auto-delete-head-branches ENABLED on cbartens/bkit via REST; branch-protection/ruleset APIs 403 — both recorded in `docs/deployments.md`).

## Blockers

None. Single doc edit (`docs/completed.md`) applied; canonical feature docs were already synced by the merged PR; no drift gap remains.
