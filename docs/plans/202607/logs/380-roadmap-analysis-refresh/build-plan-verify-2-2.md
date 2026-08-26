Verdict: FAIL
Failures: 1

<!-- verdict:end -->

# Plan Verification

## Scope

`Single` — sub-plan 2/3 (`docs/plans/202607/380-roadmap-analysis-refresh-plan-2.md`), Analysis tier (WS-3) + Cadence/Sync/Reconcile (WS-4), Tasks 8–12. Attempt 2. Verified against the on-disk plan text and source at `HEAD` = `271560a8`, diffed from `$(git merge-base HEAD origin/dev)` and filtered to sub-plan 2's scope; sub-plan 1 changes (Tasks 1–7) ignored.

## Sub-Plans Verified

`None` — Single scope.

## Integration Gaps

`None` — Single scope. Handoff to sub-plan 3 (mirror regen, `/bkit-roadmap`, cross-cutting docs) unchanged in shape.

## Previously Attempted

Attempt 1 (`build-plan-verify-2-1.md`) — FAIL, 4 blocking + 5 non-blocking gaps. Remediation attempt 1 (`build-plan-gaps-remediate-2-1-log.md`) claimed all 4 blocking + bonus Gaps 5/6 closed.

## Notes

**All four attempt-1 blocking gaps independently confirmed CLOSED.** Evidence gathered fresh, no earlier claim trusted:

- Gap 1 — `SHIP_STEP_ORDER` in `.bkit/src/bkit-status-hole-detector.ts:51` now carries `ship-roadmap-refresh` between `ship-summary` and `ship-prune-skills`; all four end-to-end fixtures + both `detectHoles` observed sets updated; `dist/bkit-status-hole-detector.js:48` rebuilt. Emitter at `bkit-ship.md:1087` writes the matching `step-done` row. **CLOSED.**
- Gap 2 — no `model-self-report` literal remains in any of the five workflow files; the `ROADMAP_SCAN_COVERAGE` emitter (`bkit-ship.md:1091`) writes `counterSource = "shell-bus"`, an enum member accepted by `bkit-telemetry.ts:711` and documented in `.bkit/jsonl.md:62`. The #58 T7.1 invariant was NOT weakened. Resolution assessed as **sound in preference order** (keeping a shipped invariant beats honouring plan prose) but **imprecise in provenance** — see Gap 4 below. **CLOSED with a caveat.**
- Gap 3 — `bkit-ship.md:1036/1040` now call `mcp__github__issue_write({ method: "update", … })` and `mcp__linear__save_issue({ id, labels })`, matching ship.md's own header declarations (lines 37/44) and the 24×/28× repo convention. `bkit-roadmap-sync.integration.test.ts:28-31` asserts the correct names **and** the absence of the `update_issue` literal, so the defect can no longer be re-encoded as the expectation. **CLOSED.**
- Gap 4 — the reverse-sync write is no longer a shell comment: `bkit-ship.md:982-1024` is a real discovery block (live-branch guard, in-flight guard, status→`bkit:{phase}` table, `{ISSUE_ID}-{slug}` id resolution, JSON candidate array) and `:1034-1045` is orchestrator-mediated MCP prose **outside** the fence under `bkit:tracker` markers, resolving `issue_number: {RS.githubIssueNumber}` and `labels: [{RS.label}]`. The unexecutable-comment defect is **CLOSED** — but the new implementation carries a blocking correctness defect of its own (Gap 1 below).

Gaps 5 and 6 from attempt 1 were also genuinely closed: row 13 now extracts and **executes** the shipped `bkit-ship.md` derive + jq emitter against a real fixture and validates the appended row through `bkit-telemetry`'s `validate()` (and the remediation surfaced + fixed a real missing `bkitVersion` envelope field while doing so); row 12's literal guards now cover the live `claude-*-5` pins plus `Claude Code` / `opencode`.

**Test numbers, run by this verification (not quoted):**

- `pnpm test`: **82 test files passed, 2769 passed | 2 skipped | 1 todo, 0 failed.** The remediation log's claim is reproducible; attempt 1's red suite is fixed.
- `npx bats tests/roadmap-cadence.bats tests/telemetry-failopen.bats`: **19/19 ok.**
- `pnpm typecheck`: clean. `pnpm format:check`: clean apart from this artifact. `pnpm lint:prose`: 1 pre-existing warning (`docs/testing.md:318`), unrelated.
- `pnpm bkit check`: 22 writes / DRIFT — all 21 listed paths are `.claude/` + `.cursor/` + `.opencode/` host mirrors. **Excluded per scope** (sub-plan 3's batched `bkit install`).

Checkbox state changed by this verification: **Task 9 `[ ]` → `[x]`** (its full Done-when is now satisfied — three subagents named, `roadmap-refresh.md` in Gate 10, no new `git add` in Step 10, `bkit-ship-invariants.test.ts` green; the only unmet clause, "`bkit check` clean", is the excluded mirror drift). **Verification bullet "This sub-plan's tests pass" `[ ]` → `[x]`.** Task 11 stays `[ ]` — its literal Done-when assertions pass, but the deliverable they cover is functionally wrong (Gap 1). Tasks 8/10/12 stay `[x]`; their sources were untouched by the remediation and re-verified green. The "Local gate suite" bullet stays `[ ]` (pending sub-plan 3's `bkit install`).

Excluded from the verdict per scope instruction: the `pnpm slop:delta` net +1/+2.40 regression from sub-plan 1 Task 2's `bkit-telemetry-migrate.ts` catch blocks (already logged in `docs/failures.jsonl`, assigned to sub-plan 3); cross-provider host-mirror drift and `bkit check` writes; the three human-owned confirmation checkboxes.

## Identified Gaps Log

6 gaps — 1 blocking, 3 medium, 2 informational.

**Gap 1 (BLOCKING, Task 11) — the reverse sync is not a DRIFT reconcile and its write is label-destructive.** Three compounding defects in the block introduced to close attempt-1 Gap 4:

1. _No drift comparison._ `bkit-ship.md:997` iterates **every** `kind=="feature"` key in `docs/roadmap.jsonl` (`jq -r 'select(.kind=="feature") | .key' … | sort -u`) and emits every settled one as a write candidate. Nothing reads the tracker's current labels, so nothing is compared. The plan mandates "reconcile ONLY settled **drift**" (Architecture § Cadence, Task 11, Process Sketch) and lists tracker `list_issues` rows as a declared read-input (§ Data Schema Usage). In this repo the ledger already holds **50 distinct FIDs**, so the next ship close would fire ~30 GitHub label writes for issues that are already correct, including long-merged ones (`58-workflow-counters`, `274`, `245-opencode-provider-host`, …).
2. _Full-label-set clobbering._ `:1036` passes `labels: [{RS.label}]` — a single-element array. Every other label write in this workflow first computes the complete new set and passes it whole (`:268` "Add `bkit:ship` to `{LABELS}` and drop other … phase labels → `issue_write(… labels: [{LABELS}])`"; `:1389` same shape), because the update is replace-semantics. As written, the reverse sync replaces each issue's entire label set with one `bkit:{phase}` label, destroying `bkit:auto`, `blocker`, `bkit:merged` and every consumer-authored label. There is no `issue_read`/`get_labels` read-modify-write step.
3. _It fights Step 13._ `SHIPPED` maps to `bkit:ship` (`:1008`), so every previously-shipped FID — whose issue Step 13 (`:1389`) deliberately left at `bkit:merged` — is relabelled back to `bkit:ship` on every subsequent ship. The two writes oscillate.

The task's four row-15 assertions (MCP-only, tracker-marker-guarded, settled predicate, never gates) all pass, so the tests do not catch any of this: they assert shape, never behaviour over a realistic ledger. Remediation should compute drift (read current labels via the wired tracker read, skip when they already agree), do a read-modify-write on the full label set following the `:268` convention, and bound the candidate set to non-terminal statuses.

**Gap 2 (MEDIUM, Task 11) — the in-flight half of the settled predicate cannot fire for most FIDs.** `bkit-ship.md:1002` builds `RS_STATUS_LOG="$BOOK_ROOT/docs/plans/{YYYYMM}/logs/$RS_FID/status.jsonl"` with the **current ship's** `{YYYYMM}`. Every candidate FID whose plan directory sits in a different month resolves to a non-existent path, the `[ -f … ]` guard is false, and the FID is silently treated as settled. Only the live-`feat/*` half of the predicate then protects it. The plan's predicate is "NO in-flight `status.jsonl` phase event for that FID" — month-agnostic. A glob over `docs/plans/*/logs/$RS_FID/status.jsonl` would satisfy it.

**Gap 3 (MEDIUM, Task 11) — the candidate file is untracked residue.** `bkit-ship.md:995` writes `$BOOK_ROOT/.bkit/.roadmap-reverse-sync-{FID}.json`; only the `.tmp` sibling is removed (`:1024`). `git check-ignore` confirms the path is **not** ignored, while sub-plan 1's structurally identical sibling `.bkit/.roadmap-tracker-rows-*.json` **is** (`.gitignore:55`, `.bkit/templates/gitignore:47`). Every ship in a consumer repo leaves an untracked file in `.bkit/`. Add the glob to both gitignores (or delete the file after the MCP prose consumes it).

**Gap 4 (MEDIUM, Tasks 8/10 — assessment of the logged Gap-2 deviation).** Choosing `shell-bus` over weakening the shipped #58 T7.1 invariant was the right ordering, but the label is not strictly honest: the value's ground truth is the model's own `ROADMAP_SCAN_COVERAGE: [scanned]/[total]` line in `roadmap-refresh.md` (`.bkit/prompts/bkit-roadmap-refresh.md:79`); the shell only greps it and computes `SCANNED*100/TOTAL`. `bkit-analysis.ts:168` defines `shell-bus` as "post-P3 deterministic" and `model-self-report` as "untrusted", and `:395` reports the two as trust tiers — so this row will be counted as trusted. A third option existed that satisfies both the plan and the invariant (the invariant is file-scoped to the five `.bkit/workflows/*.md`): emit the row from a sourceable script such as `.bkit/scripts/bkit-roadmap-cadence.sh`, keeping `counterSource: "model-self-report"`. Secondary effect: the plan text is now stale against the code — matrix row 13 (line 107) and § Data Schema Changes (line 220) both still mandate `counterSource: "model-self-report"`, and sub-plan 3 Task 14 documents this counter in `.bkit/jsonl.md` from that text. Either revise the two plan lines or re-site the emitter.

**Gap 5 (INFO, Task 9 — carried from attempt-1 Gap 9, unchanged).** `bkit-roadmap-staging.integration.test.ts:194` claims the artifact is "named in the wait/assert list and Gate 10" but only checks that `roadmap-refresh.md` appears somewhere in Step 10. The real wait/assert (`bkit-ship.md:1061`) is generic prose. Gate 10 (`:1120`) does name the artifact, and the subagent Create line (`:1060`) does too, so the plan's intent is met in substance; the test's title overstates what it proves.

**Gap 6 (INFO, Tasks 10/12 — carried from attempt-1 Gap 7, unchanged).** `tests/roadmap-cadence.bats`, `bkit-roadmap-reconcile.integration.test.ts` and both new `telemetry-failopen.bats` cases source the `.bkit/templates/.bkit/scripts/…` copies; the live `.bkit/scripts/…` copies that this repo's own ship run sources have no byte-identity assertion (`bkit-dogfood-noop.integration.test.ts` hardcodes only two unrelated scripts). `diff` confirms all three pairs are byte-identical today, so this remains a durability gap, not a live break.
