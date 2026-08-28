# Docs Update

FID `380-roadmap-analysis-refresh` · issue #380 · PR #411 · squash `5f123d946a167b9c70a48c32439281646c0ea7ff`.

## Files Modified

- `docs/architecture.md` (+19/-1)
- `docs/setup.md` (+13)
- `docs/roadmap.jsonl` (+1 — canonical feature-ledger row, § Roadmap Ledger Row below)
- `docs/deployments.md` — edited, then **reverted to byte-original** (§ Reverted below). Net diff empty.

## Drift Resolved

### `docs/roadmap.jsonl` — feature-ledger row (step 6)

Appended one `kind:"feature"` row via the `.bkit/jsonl.md` § Write Idiom (`jq -c -n … | .ts = (now*1000|floor)`, `ts` minted at append time, never a literal):

| Field               | Value                                                                                          |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| `key`               | `380-roadmap-analysis-refresh`                                                                 |
| `status`            | `SHIPPED`                                                                                      |
| `category`          | `agentic`                                                                                      |
| `workflow` / `step` | `ship` / `ship-update-docs`                                                                    |
| `bkitVersion`       | `4.12.0` (from `.bkit/version` `pinnedVersion`)                                                |
| `references`        | `380`, `ISSUE-380`, `PR-411`, `5f123d946a167b9c70a48c32439281646c0ea7ff`, master plan, log dir |
| `severity`          | absent (REQUIRED absent on `kind:"feature"`)                                                   |

Verified with the exact probe `bkit-ship.md` Step 10 uses: `SHIPPED_HIT=1` → `DOCS_VERDICT=PASS`. `ts=1787868628424` (`ts % 1000 = 424`, non-round → real mint). Whole file re-parses as valid NDJSON (52 rows).

Prior state of this FID in the ledger was a single bootstrap-seeded `status:"PLANNED"` row, so this append is the phase advance, not a duplicate.

### `docs/architecture.md` — Sync + Cross-Reference

Closed the gap raised as `380-architecture-md-not-updated-for-roadmap-ledger-and-scripts` (zero occurrences of "roadmap" before this edit).

1. **Package Boundaries tree** — `bkit-telemetry-migrate.ts` described only three legacy pairs. Now names the fifth pair `docs/completed.md → docs/roadmap.jsonl` and the in-flight bootstrap seed; tag widened to `(#234 WS-5, #380)`.
2. **New `## Roadmap Ledger & Board (#380)` section**, placed after the `Knowledge/Decisions JSONL Ledgers` section to match the existing per-subsystem shape. Covers: `docs/roadmap.jsonl` as canonical ledger vs `docs/roadmap.md` as pure projection; the three shipped scripts (`bkit-roadmap-fold.sh`, `bkit-roadmap-cadence.sh`, `bkit-roadmap-reconcile.sh`); `@bkit-roadmap-refresh`; `/bkit-roadmap`; the migrate fifth pair; the consumer-ownership / marker-block boundary; on-disk-first tracker-additive sensing; fail-open-never-gates.
3. **Cross-Reference pass** — inline links out instead of restating: `docs/observability.md` § `[bkit-roadmap]` (grep keys), `.bkit/jsonl.md` § Per-Kind Fields (row contract), `docs/testing.md` (test inventory), `docs/setup.md` § Roadmap ledger migration (the command). No content duplicated from those docs.

`docs/completed.md` is described as retired/deleted; the file is not recreated or referenced as live anywhere.

### `docs/setup.md` — Sync

Closed the gap raised as `380-consumer-migrate-doc-row-not-applied-to-setup-md` — sub-plan 3 § Documentation Updates row "Consumer install/upgrade doc (`docs/setup.md` or the upgrade help text)" (zero occurrences of `telemetry migrate` or `roadmap.jsonl` before this edit).

New `## Roadmap ledger migration` section between `## Bootstrap` and `## Verify`, carrying the four load-bearing facts the plan row required:

- the `bkit telemetry migrate` command, with `--dry-run` first;
- parity-gated + destructive — mismatch aborts with zero `.md` deleted; re-run is an idempotent no-op;
- deliberately NOT auto-run by `bkit upgrade`; `bkit install` / `bkit check` raise the `completed-md-unmigrated` advisory while the `.md` remains;
- until it runs the board is **EMPTY, not wrong** — no `completed.md` fallback reader exists (deleted with the file), and the fold prints a `[bkit-roadmap]` hint naming the command.

Wording reuses the already-shipped advisory text at `.bkit/src/bkit-preflight.ts` (`completed-md-unmigrated`) so the doc and the runtime advisory cannot drift apart.

### Reverted — `docs/deployments.md`

Added roadmap paths + the frozen `BOOK_PATHS` allow-list to the § Ship gate + bookkeeping paragraph, then **reverted it in full**. Reason: that paragraph is at line ~231, inside the `<!-- bkit:start -->` … `<!-- bkit:end -->` managed block (lines 1–479). Per Project Rules § Repo Authoring the SSOT is `.bkit/templates/docs/deployments.md` and a repo-copy edit is mirror-editing; `bkit check` confirmed it as drift (`core: docs/deployments.md`, "2 write(s) would occur"). Applying it properly needs a template edit plus a batched `bkit install` mirror regen — beyond a docs-sync mandate and not safe to run mid-ship over uncommitted bookkeeping. Left for a follow-up; surfaced under Pending Items rather than dropped. After revert `bkit check` reports **0 write(s) would occur**.

### Docs checked, already in sync (no edit needed)

| Doc                                                                                                   | Why no change                                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/observability.md`                                                                               | `[bkit-roadmap]` prefix section + all fail-open grep keys already landed during build (sub-plan 3 Task 14).                                                                             |
| `docs/testing.md`                                                                                     | All new `*.test.ts` / `*.integration.test.ts` + `tests/roadmap-fold.bats` / `tests/roadmap-cadence.bats` already listed.                                                                |
| `.agents/docs.md`                                                                                     | `docs/completed.md` row already replaced by `docs/roadmap.jsonl`; `docs/roadmap.md` row present under Project Documents.                                                                |
| `.bkit/jsonl.md`                                                                                      | `kind:"feature"`, six-state ladder, `ABANDONED` idiom, both `counterName`s all present.                                                                                                 |
| `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/design.md`, `docs/warnings.md` | No shipped surface in this cycle touches their scope.                                                                                                                                   |
| `docs/roadmap.md`                                                                                     | Generated artifact — regenerated by the fold at `bkit-ship.md` Step 10 sub-step 5 (orchestrator-owned). Hand-editing inside its marker blocks is banned by its own header. Not touched. |
| `docs/knowledge.jsonl`, `docs/decisions.jsonl`                                                        | Excluded by this agent's Contract. Rows for this cycle already landed during build.                                                                                                     |

## Gate results

| Gate                             | Result                                                                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `prettier --check` (edited docs) | PASS                                                                                                                           |
| `pnpm lint:prose` (vale)         | 0 errors, 2 warnings — both pre-existing lines (`docs/testing.md:384`, `docs/deployments.md:570`), neither in an edited region |
| `pnpm bkit check`                | 0 write(s) would occur — drift clean                                                                                           |
| `pnpm slop:delta`                | added 8, resolved 8, worsened 0; net findings 0, net score 0.00 — PASS                                                         |
| `pnpm vitest run`                | 3728 passed, 1 failed, 2 skipped, 2 todo (107 files) — see Blockers                                                            |

## Pending Items

`{FID}` matches in `docs/deferrals.jsonl` (surfaced for human review; this agent's Contract forbids writing that ledger, and `.bkit/jsonl.md` § Ledgers & Writers assigns `deferral` rows to `@bkit-ship-deferred-sweep`). Latest folded state per key:

| Key                                                                       | Status  | Reason           | Recommendation                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------- | ------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `380-architecture-md-not-updated-for-roadmap-ledger-and-scripts`          | TRIAGED | `unjustified`    | **READY TO CLOSE** — remediated in full this step. Both named defects fixed: the missing roadmap coverage and the stale three-pair `bkit-telemetry-migrate.ts` line. Append a same-`key` `status:"CLOSED"` row carrying `reason:"unjustified"` verbatim, `references` → `380`, `PR-411`, `docs/architecture.md`, this log.          |
| `380-consumer-migrate-doc-row-not-applied-to-setup-md`                    | TRIAGED | `unjustified`    | **READY TO CLOSE** — remediated in full this step. `docs/setup.md` § Roadmap ledger migration now carries all four facts the plan row required. Append a same-`key` `status:"CLOSED"` row carrying `reason:"unjustified"` verbatim, `references` → `380`, `PR-411`, `docs/setup.md`, this log.                                      |
| `380-bootstrap-seed-key-namespace-mismatch-vs-migrated-completed-md-keys` | OPEN    | `needs-decision` | **Human decision owed** — bootstrap-seed FIDs (`docs/plans/**` slugs) do not match migrated `completed.md` keys (`stableKey("completed", title)`), so already-shipped legacy plans can re-appear as in-flight on the board. Choose: (a) cross-check before seed, or (b) accept one-time board noise. Not remediable as a docs edit. |
| `380-dev-located-roadmap-status-write-for-build-debug-closes`             | CLOSED  | —                | No action.                                                                                                                                                                                                                                                                                                                          |
| `380-persisted-frontier-snapshot-event-log-for-260`                       | CLOSED  | —                | No action.                                                                                                                                                                                                                                                                                                                          |
| `380-first-bootstrap-preserve-preexisting-consumer-roadmap-content`       | CLOSED  | `unjustified`    | No action.                                                                                                                                                                                                                                                                                                                          |
| `380-roadmap-md-generated-but-not-prettier-ignored`                       | CLOSED  | `needs-decision` | No action.                                                                                                                                                                                                                                                                                                                          |
| `380-debug-attempt-1-aborted-rebase-conflicts-before-diagnosis`           | CLOSED  | —                | No action.                                                                                                                                                                                                                                                                                                                          |

**Identified, deliberately NOT done (not silently dropped):**

1. **`docs/deployments.md` § Ship gate + bookkeeping does not name the roadmap paths or the frozen `BOOK_PATHS` allow-list.** The bookkeeping sentence still reads "`status.jsonl`, ship artifacts" although the close commit now also carries `docs/roadmap.jsonl` + `docs/roadmap.md`. Blocked on the managed-block/SSOT boundary described under Reverted; correct fix is `.bkit/templates/docs/deployments.md` + batched `bkit install`. Not a plan Documentation Updates row and not raised by the Step 5 sweep — recommend a new `docs`-category deferral or a follow-up docs commit outside this ship run.
2. **`docs/architecture.md` § Package Boundaries tree has no `.bkit/scripts/` entry at all.** Pre-existing gap, not introduced this cycle; the three new roadmap scripts are instead documented in the new subsystem section. Widening the tree would touch every unrelated script and is out of this cycle's scope.

## Blockers

`pnpm vitest run` — **1 pre-existing environmental failure, not caused by this step and not a ship blocker:**

- `.bkit/src/bkit-preflight.test.ts > detectBkitNotOnPath > returns advisory when 'bkit' is not on PATH` — expected a finding, got `null`. Cause: `detectBkitNotOnPath()` short-circuits on `isCloudOrCi()` (`bkit-preflight.ts:1309`) before it ever reads `PATH`; this sandbox exports cloud markers (`CLAUDECODE=1`, `CLAUDE_CODE_REMOTE=true`, `CURSOR_API_KEY`) that the test does not clear — it deletes only `process.env.CI`. Environment-dependent, deterministic here, and unreachable from a `.md` / `.jsonl` docs edit. The three files changed in this step contain no TypeScript.
- Recommend a `docs/failures.jsonl` row (`category:"testing"`) against the test's incomplete env isolation, written by an agent that owns that ledger.

No blocker attributable to this step. Nothing committed — the orchestrator owns git.
