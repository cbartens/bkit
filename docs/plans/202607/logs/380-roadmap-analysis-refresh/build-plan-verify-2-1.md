Verdict: FAIL
Failures: 4

<!-- verdict:end -->

# Plan Verification

## Scope

`Single` — sub-plan 2/3 (`docs/plans/202607/380-roadmap-analysis-refresh-plan-2.md`), Analysis tier (WS-3) + Cadence/Sync/Reconcile (WS-4), Tasks 8–12. Attempt 1. Verified against the on-disk plan text and source at `HEAD` = `1ee40a0e`, sub-plan-2-scoped changes only (`git show 1ee40a0e`); sub-plan 1 changes ignored (already verified PASS at attempt 4).

## Sub-Plans Verified

`None` — Single scope.

## Integration Gaps

`None` — Single scope. (Cross-sub-plan handoff to sub-plan 3 unaffected in shape, but blocked on the failures below.)

## Previously Attempted

`None` — first verification attempt for sub-plan 2. Sub-plan 1 attempts 1–4 (`build-plan-verify-1-1.md` … `-1-4.md`) covered Tasks 1–7 only.

## Notes

Verified independently of the execute log. Evidence gathered: full `pnpm test` (2 files / 6 tests RED), `npx bats tests/roadmap-cadence.bats tests/telemetry-failopen.bats` (19/19 green), `pnpm typecheck` (clean), `pnpm format:check` (clean apart from this artifact), `pnpm lint:prose` (1 pre-existing warning), source reads of the prompt, both new shell scripts, the ship Step-10 rewrite, and all four new/extended test files.

The execute log's claim "Full test run: 152 Vitest tests + 29 bats tests all green" is not reproducible: that was a scoped run. The real `pnpm test` is **red** — 6 failures in 2 files, both caused by this sub-plan's `bkit-ship.md` Step-10 edit (`git show origin/dev:.bkit/workflows/bkit-ship.md` and `68f70278:` both carry 0 occurrences of the offending tokens; `1ee40a0e` introduces them).

Strong work, kept as-is: `bkit-roadmap-cadence.sh` + `tests/roadmap-cadence.bats` (real jq/shell, ground-truth assertions on distinct-FID counting, dedup-by-key, staleness, rebaseline, defaults, fail-open — each case would fail on a real regression) and `bkit-roadmap-reconcile.sh` + `bkit-roadmap-reconcile.integration.test.ts` (real temp git repo, real branches, sources the shipped function, asserts warn/silent/no-mutation/exit-0). `bkit-roadmap-sync.integration.test.ts` correctly resolves through the real `substituteWorkflow` tracker resolver rather than raw string presence — but it pins the wrong tool names (Gap 3).

Checkbox state changed by this verification: Task 9 and Task 11 reverted `[x]` → `[ ]`. Tasks 8, 10, 12 left `[x]` (Done-when substantively satisfied; concerns logged). Both sub-plan Verification checkboxes left `[ ]` — the local gate suite is not green.

Excluded from the verdict per scope instruction: host-mirror/cross-provider drift and `bkit check` writes (deferred to sub-plan 3's batched `bkit install`), absence of `bkit-roadmap-refresh` from `.bkit/version` (same batch), and the three human-owned confirmation checkboxes. Also noted but not a defect: the plan's Verification block names `pnpm lint`, which is not a script in `package.json` (only `lint:slop` / `lint:workflows` / `lint:prose`).

## Identified Gaps Log

9 gaps — 4 blocking, 3 medium, 2 low/informational.

**Gap 1 (BLOCKING, Task 9) — `pnpm test` red: `.bkit/src/bkit-status-hole-detector.test.ts`, 5 failures.** The new `ship-roadmap-refresh` status step added to `bkit-ship.md` Step 10 item 7 is absent from the frozen canonical step set and from all four end-to-end fixtures: `source-derived set AGREES with the frozen canonical set` → `["source-but-not-canonical:ship-roadmap-refresh"]`; `Path A` / `Path B` / `MERGED-on-entry` / `retry-loop Path B` → `report.missing = ["ship-roadmap-refresh"]`. Companion change to `bkit-status-hole-detector.ts` (canonical set) + the four fixtures was never made.

**Gap 2 (BLOCKING, Task 9) — `pnpm test` red: `.bkit/src/bkit-counter-prose-audit.test.ts` #58 T7.1 `no workflow file still carries a model-self-report literal`.** The Step-10 item 7 `ROADMAP_SCAN_COVERAGE` emitter writes `--arg counterSource "model-self-report"` into `.bkit/workflows/bkit-ship.md`, which the pre-existing #58 invariant bans outright for all 5 workflow files. This is a genuine plan-vs-existing-gate conflict (the plan's Data Schema Changes mandates `counterSource: "model-self-report"`); the executor shipped the literal and left the repo red instead of resolving it (e.g. emit the row from a sourceable script outside the workflow prose, or amend the invariant with a scoped, justified exemption).

**Gap 3 (BLOCKING, Task 11) — invalid MCP tool names, with the defect encoded as the test expectation.** `bkit-ship.md:1000-1001` and `:1016-1017` call `mcp__github__update_issue` and `mcp__linear__update_issue`. Neither exists: ship.md's own header declares the GitHub write surface as `mcp__github__issue_write` (methods `create` / `update`) and the Linear one as `mcp__linear__save_issue`. Repo-wide inventory: `issue_write` 24×, `save_issue` 28×, `update_issue` 2× each — only these new lines. Worse, `bkit-roadmap-sync.integration.test.ts:26-27` asserts `toMatch(/mcp__github__update_issue/)` / `toMatch(/mcp__linear__update_issue/)`, so the test is green **because** the wrong names are shipped and would go red if they were corrected. This is exactly the "test asserts a string exists in a shipped file" failure class.

**Gap 4 (BLOCKING, Task 11) — the reverse-sync write is unexecutable and underspecified.** The tracker write is a shell **comment** inside a `for` loop inside a fenced bash block (`# mcp__github__update_issue({...})`) — the only occurrence of that shape anywhere in `.bkit/workflows/**`; every other per-item MCP call is prose outside a code fence (e.g. `bkit-design.md:627` "For each workstream …"). An orchestrator executing that bash block cannot issue an MCP call mid-loop, so as shipped the loop only echoes `[bkit-roadmap]` lines and no label is ever written. Compounding it: `labels: [...]` is a literal ellipsis with no `roadmap` status → `bkit:{phase}` label mapping (the `RS_PHASE` value is computed then only echoed), and `issue_number: <resolved from $RS_FID>` names no resolution mechanism. Directive 3's deliverable ("reconciles tracker labels to the board") is therefore not implemented, even though the four row-15 assertions pass.

**Gap 5 (MEDIUM, Task 8) — matrix row 13 test is tautological.** `bkit-roadmap-refresh-prompt.test.ts:96-116` hand-constructs a literal counter row in the test body and validates that constant against `validate()` from `bkit-telemetry.js`. It never reads the shipped emitter in `bkit-ship.md`, so a regression there (wrong `counterName`, dropped `counterSource`, non-numeric `counterValue`, missing `parentSha`) leaves the test green. The plan's Done-when says "the **emitted** … counter row conforms". A stronger in-repo precedent exists: `bkit-counter-prose-audit.test.ts` extracts jq filters from workflow prose and executes them under bash.

**Gap 6 (MEDIUM, Task 8) — matrix row 12 literal patterns miss the live surface.** The model-ID guard lists `claude-opus-4-\d`, `claude-sonnet-4-\d`, `claude-haiku-4-\d`, `gpt-5`, `gemini-\d`, but this repo's live pins are `claude-opus-5` (25×) and `claude-sonnet-5` (17×) — the single most likely regression ("recommend `claude-sonnet-5` for mechanical execution" in the body) would not fail the test. The IDE guard lists `VS Code` / `Cursor` / `JetBrains` / `Webstorm` but omits `Claude Code` and `opencode`, two of the three IDEs bkit actually renders mirrors for.

**Gap 7 (MEDIUM, Tasks 10 + 12) — only the template copy of the new scripts is under test.** `tests/roadmap-cadence.bats:16`, `bkit-roadmap-reconcile.integration.test.ts:20-27` and both new `telemetry-failopen.bats` cases source `.bkit/templates/.bkit/scripts/…`; the live `.bkit/scripts/…` copies — the ones the bkit repo's own ship run sources via `$BOOK_ROOT/.bkit/scripts/` — have no byte-identity assertion. `bkit-dogfood-noop.integration.test.ts:93-122` hardcodes only `bkit-ship-gate.sh` and `bkit-ship-timeouts.sh`. Both pairs are byte-identical today (verified by `diff`), so this is a durability gap, not a live break.

**Gap 8 (LOW, Task 10) — inert assertion in the new fail-open bats case.** `tests/telemetry-failopen.bats` "#380: `.bkit/stats.jsonl ROADMAP_CADENCE_FIRE` append to a read-only directory" captures `STATUS=$?` immediately after an `OUTPUT=$(…)` assignment, so `[ "$STATUS" -eq 0 ]` is always true regardless of behaviour; only the `[[ "$OUTPUT" == *"[bkit-roadmap]"* ]]` line carries signal. The case also re-inlines a hand-copied duplicate of the jq emitter instead of extracting it from `bkit-ship.md`, so it cannot detect emitter drift.

**Gap 9 (INFO, Task 9) — staging-test claim is looser than its name.** `bkit-roadmap-staging.integration.test.ts` "the roadmap-refresh.md artifact is named in the wait/assert list and Gate 10" only checks that `roadmap-refresh.md` appears somewhere in Step 10; the actual wait/assert (item 5) is generic prose ("assert subagent Update / Create files exist") and never names the artifact. Gate 10 does name it, so the plan's intent is met in substance.
