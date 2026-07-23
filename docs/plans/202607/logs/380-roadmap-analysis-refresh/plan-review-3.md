Verdict: CONCERNS
Failures: 2

<!-- verdict:end -->

# Plan Review

Lens: Regression risk, design-coverage.

## Surface-Area Map

Per Agent Execution Runbook task — files/symbols/schemas touched and their consumers.

- **Task 1 (`completed.jsonl` codec)** — edits `.bkit/src/bkit-telemetry.ts` (`TelemetryKind`, `VALID_KINDS`, `TelemetryEvent` union, `validate`, `identity()` default). SHARED UTILITY / public-ish contract. Consumers: every reader that switches on `kind` / consumes `VALID_KINDS` (`bkit-harvest.ts`, `bkit-analysis`, telemetry readers — greppable). Seeds `docs/completed.jsonl` (+template); `.gitattributes` (+template) gains `merge=union`.
- **Task 2 (backfill)** — new `.bkit/scripts/bkit-completed-backfill.sh` (+template). Reads `docs/completed.md`, writes `docs/completed.jsonl`. One-shot idempotent. Boundary: real fs.
- **Task 3 (`bkit-roadmap-fold.sh`)** — new template + installed script. SOURCES `BKIT_STATUS_FOLD` from `bkit-status-fold.sh` (shared reducer, #58). Reads `docs/plans/**`, `status.jsonl`, `completed.jsonl`; writes `docs/roadmap.md` `roadmap-status` (per-FID upsert). Boundary: real `jq`/`sh`/`git`.
- **Task 4 (doc-index)** — `.agents/docs.md` (+template), `.gitattributes` `roadmap.md merge=union`.
- **Task 5 (ship verdict migration)** — MODIFIES `bkit-ship.md` (`UPDATE_DOCS_VERDICT`, ~L902) + `@bkit-ship-update-docs` (`.bkit/prompts/bkit-ship-update-docs.md`) + `docs/completed.md` header (+template, hash-gated). BACKWARDS-COMPAT BOUNDARY: the shipped-FID source of truth moves `completed.md` → `completed.jsonl`.
- **Tasks 6–7 (close hooks)** — MODIFY all shipped Close steps: `bkit-design.md`, `bkit-plan.md` (STRAY allowlist widen), `bkit-build.md` (Step 17), `bkit-debug.md` (Step 10) — build/debug gain first-ever `dev`-located write under the dev-lock (4th staging shape), `bkit-ship.md`. HIGH-RISK: shared workflow surface across all five workflows + the STRAY guard.
- **Tasks 8–9 (analysis leaf)** — new `.bkit/prompts/bkit-roadmap-refresh.md`; MODIFIES `bkit-ship.md` Step 10 (third parallel subagent + Gate-10). Emits `ROADMAP_SCAN_COVERAGE` counter.
- **Tasks 10–12 (cadence/sync/reconcile)** — MODIFY `bkit-ship.md` cadence step. Reads `.bkit/stats.jsonl` ship `outcome` rows; reverse tracker-label MCP write; reconcile over live `feat/*`.
- **Task 13 (`/bkit-roadmap`)** — new `.bkit/workflows/bkit-roadmap.md`.
- **Tasks 14–15 (docs + mirror regen)** — `docs/observability.md` (`[bkit-roadmap]` prefix), `.bkit/jsonl.md`, `decisions.jsonl`/`knowledge.jsonl`, close the `380-dev-located…` deferral; host mirrors (`.claude`/`.cursor`/`.opencode`) + `.bkit/version` `canonicalHashes` (new script + changed `completed.md`).

**Design-coverage:** the design's WS-1..WS-6 + Addenda A–G + Re-review directives 1–5 each map to concrete plan tasks (verified against `380-roadmap-analysis-refresh-design.md`). No touched surface is parked out of scope without a note. The two open deferrals are correctly handled: `380-dev-located…` folded in + CLOSED (Task 14); `380-persisted-frontier-snapshot…` kept deferred. Design-coverage is COMPLETE.

## CRITICAL

1. **`merge=union` on the upsert-structured `roadmap-status` block re-enters KN-42's `-X ours` duplicate-line class with no dedupe guarantee and no test.** The plan adds `docs/roadmap.md merge=union` (Task 4, Data Schema Changes) and asserts both `completed.jsonl` and `roadmap.md` are "append/upsert-only-safe" (Architecture §.gitattributes, L354). `merge=union` is only safe for genuinely append-only ledgers. The `roadmap-status` block is an UPSERT region (one row per FID keyed on FID), NOT append-only — a union merge keeps BOTH sides' lines on any conflicting hunk, producing DUPLICATE FID rows. This is exactly KN-42 (`kn-42-pre-release-main-dev-backmerge-with-x-ours-duplicate`): two lines sharing a long identical prefix (here `{FID} | {Title} | …`, differing only in the trailing `Last-transition ts`) are aligned by git as two INDEPENDENT insertions, no conflict fires, `-X ours` never resolves them, and both survive. The plan's edge-case table and the design's conflict-safety model (design L287) both assert `-X ours` on the status region is "a non-event" for the writer's own row — but neither reconciles that claim against KN-42, and the flip from the design's original full-regenerate to Directive 1's per-FID upsert REMOVED the whole-block rebuild that would have collapsed such duplicates. The per-FID upsert is specified only as "rewrite ONLY the closing FID's row within its phase section" (Architecture WS-1) — it does not guarantee collapsing PRE-EXISTING duplicate rows for that FID, and no Derived Test Matrix row covers "two rows for one FID collapse to one on the next upsert" (row 2 covers preserve-don't-revert, not de-dup). Regression vector: a shipped board silently carries duplicate/stale FID rows after any union/`-X ours` collision. Plan must (a) make the upsert idempotently collapse all rows matching the FID key, not just rewrite the first match, (b) add a matrix row proving duplicate-FID-row collapse, and (c) acknowledge KN-42 in the knowledge cross-reference (currently absent from the Documentation Updates `knowledge.jsonl` rows).

2. **The `bkit-roadmap-fold.sh` template/repo byte-match test re-enters the CLOSED macOS-only `md5` portability failure without acknowledging the fix.** Matrix row 7 / Task 3 add `bkit-roadmap-fold.test.ts` asserting "template copy exists and repo copy byte-matches," and Pre-Flight (L280) says it follows "the `bkit-status-fold.test.ts` pattern." `related-failures.md` records `status-fold-test-md5-macos-only-fails-linux-ci`: `bkit-status-fold.test.ts` computed the fold-blob hash via `sh -c '…' | md5` (BSD/macOS-only), passed locally, and red only on Linux CI — the exact green-on-mac/red-on-CI class `docs/testing.md` warns about. The documented remediation is to hash in-process with `node:crypto` `createHash('md5')`. The plan nowhere states the new byte-match must use `node:crypto` rather than a shell `md5` shell-out; a naive implementer copying the pre-fix idiom reintroduces the identical cross-platform regression. Plan must explicitly require the node-crypto hashing path for the new fold byte-match (low-effort; satisfied automatically only if the ALREADY-FIXED reference test is copied verbatim).

## OPTIONAL

- **No behavioral/boundary test for the first-ever build/debug write to `dev` (4th staging shape).** Task 7's `Done when` is a workflow-file text assertion (`bkit-roadmap-staging.integration.test.ts`, boundary: workflow files) that the dev-lock write and `git add -A` are PRESENT — it never exercises the dev-lock acquire/trap/`checkout dev`/FF/return over a real git repo. build/debug touching `dev` is genuinely new and high-risk (lock contention, a stranded-on-`dev` worktree — cf. the repo's known `core.bare`/worktree-state fragility). Task 12's reconcile test already demonstrates the plan CAN drive real git branches; recommend an integration/bats test that runs the build/debug dev-write against a temp git repo and asserts the worktree returns to `feat/*` and the row lands on `dev`, fail-open when the lock is held.

- **The writer half of the `completed.md → completed.jsonl` atomic migration is untested.** Matrix row 10 tests only the READER (verdict resolves from a fixture `completed.jsonl`). No row proves `@bkit-ship-update-docs` actually appends a reader-valid `completed.jsonl` row. The failure mode is loud/fail-safe (the same ship's verdict FAILs), so it is caught on first dogfood ship — but Manual Verification (Step 1–3) does not include a real ship-close. Recommend an end-to-end row closing the loop: writer appends → reader resolves PASS on the same FID.

- **Dual-write drift is unguarded.** Task 5 keeps `completed.md` human-readable via dual-write. Nothing tests that both sinks stay in sync; a writer that silently drops the `completed.md` append rots the human view without any gate noticing. Consider an assertion that both receive the FID.

- **Extend fail-open observability coverage.** `tests/telemetry-failopen.bats` is the established home for `|| echo "[prefix] …"` exit-0 contracts. Matrix row 4 covers the fold fail-open, but the build/debug dev-write fail branches (lock held / offline) and the reverse-sync fire/skip/conflict branches are only text-asserted (rows 11/15). Recommend a bats case asserting each new `[bkit-roadmap]` fail branch exits 0.

## OUT OF SCOPE

- **The two new shipped shell scripts (`bkit-roadmap-fold.sh`, `bkit-completed-backfill.sh`) enlarge the unlinted shell surface** the OPEN deferral `58-no-shellcheck-gate-over-bkit-scripts` already tracks (no CI runs `shellcheck` over `.bkit/scripts/*.sh`; actionlint only lints `run:` blocks). A POSIX-portability regression in either new script would land green. Not this plan's remit — belongs to that deferral — but worth noting the surface it grows.

- **Persisted `roadmap.jsonl` frontier event-log** (`380-persisted-frontier-snapshot-event-log-for-260`) — correctly kept deferred to #260; do not build.

- **#80 lens-engine concrete audits** and **#260 autonomous actuator/sensing contract** — correctly parked; the cadence injects a generic "run an audit" reference and the fold/leaf boundary preserves the #260 evolution path.

- **`bkit harvest`/`bkit analysis` ingestion of `completed.jsonl`** — codec-acceptance only; no reader consumes it yet. Correctly out of scope.
