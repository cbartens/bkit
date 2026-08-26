Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Plan Verification

## Scope

`Single` — sub-plan 2/3 (`docs/plans/202607/380-roadmap-analysis-refresh-plan-2.md`), Analysis tier (WS-3) + Cadence/Sync/Reconcile (WS-4), Tasks 8–12. Attempt 3 (final). Verified against on-disk source at `HEAD` = `c1185e4d`, diffed from `$(git merge-base HEAD origin/dev)` and filtered to sub-plan 2's scope; sub-plan 1 changes (Tasks 1–7) ignored.

## Sub-Plans Verified

`None` — Single scope.

## Integration Gaps

`None` — Single scope. Handoff to sub-plan 3 (mirror regen, `/bkit-roadmap`, cross-cutting docs, `.bkit/jsonl.md` counter row) unchanged in shape.

## Previously Attempted

Attempt 1 (`build-plan-verify-2-1.md`) — FAIL, 4 blocking gaps. Attempt 2 (`build-plan-verify-2-2.md`) — FAIL, 1 blocking gap (the reverse-sync block: no drift comparison, label-destructive single-element array, `SHIPPED`->`bkit:ship` oscillation) + 3 medium + 2 informational. Remediation attempt 2 (`build-plan-gaps-remediate-2-2-log.md`, strategy PIVOT) claimed all three blocking defects plus the month-hardcoded status path, the untracked scratch file, and a latent `jq -nc` bug closed, with the row-15 test rewritten to exercise behaviour.

## Notes

**The attempt-2 blocking gap is independently confirmed CLOSED, and the rewritten tests genuinely detect its reintroduction.** Every claim below was re-derived from source in this session; no prior log was trusted.

**Gap 1.1 — drift comparison.** `.bkit/workflows/bkit-ship.md:1048-1062` is now an explicit DRIFT reconcile: a `mcp__github__issue_read({ method: "get", … })` / `mcp__linear__get_issue({ id })` read of `{RS_CURRENT_LABELS}` precedes any write, `{RS_NEW_LABELS}` is computed locally, and an "already in sync" skip fires when the two sets agree. The shell fence remains candidate DISCOVERY only (explicitly documented as such at `:999-1008`), and the write verdict has moved to the per-tracker prose. Tool names match `bkit-ship.md`'s own header declarations (`:37` / `:44`). **CLOSED.**

**Gap 1.2 — label-destructive write.** The `labels: [{RS.label}]` single-element array is gone from both tracker branches; both now pass `labels: [{RS_NEW_LABELS}]`, computed as current-minus-phase-label plus the desired one, with `bkit:auto` / `bkit:debug` / `bkit:failed` / `blocker` / consumer labels named as preserved — the same read-modify-write convention as `:268` and `:1389`. **CLOSED.**

**Gap 1.3 — `SHIPPED` oscillation.** The mapping table at `:1022` is `{DESIGNED:"design",PLANNED:"plan",BUILT:"build",DEBUGGED:"debug",SHIPPED:"merged"}` — terminal-aware, so a previously-shipped FID resolves to the same `bkit:merged` Step 13 already set and the drift gate turns it into a no-op. **CLOSED.**

**Gap 2 (month-hardcoded status path) — CLOSED.** `:1016` resolves via `ls "$BOOK_ROOT"/docs/plans/*/logs/"$RS_FID"/status.jsonl | head -1`.

**Gap 3 (untracked scratch file) — CLOSED.** `.bkit/.roadmap-reverse-sync-*.json` is in both `.gitignore:56` and `.bkit/templates/gitignore:48`; `git check-ignore -v` confirms the path is ignored. An explicit `rm -f` cleanup exists at `:1067`.

**The reported latent `jq` bug is real and the fix is correct.** Reproduced directly: `jq -nc --arg gh "" --arg li "TEAM-42" '{githubIssueNumber:($gh|select(.!="")), …}'` emits **zero output** (exit 0) — `select` in an object-literal value position is a generator, so an empty field collapsed the whole object and silently dropped every candidate. The shipped form `(if $gh=="" then null else $gh end)` emits the object correctly. This was a genuine silent-no-op bug in the block under remediation.

**Mutation testing of the rewritten row-15 suite (the specific concern raised in this task).** I reintroduced each defect into the real `bkit-ship.md`, ran `.bkit/src/bkit-roadmap-sync.integration.test.ts`, and restored (file confirmed byte-identical afterwards):

<!-- prettier-ignore -->
| Reintroduced defect | Result |
| --- | --- |
| `SHIPPED:"merged"` -> `SHIPPED:"ship"` | **2 of 8 tests fail** (prose guard + behavioural fixture assertion) |
| `labels: [{RS_NEW_LABELS}]` -> `labels: [{RS.label}]` | **1 of 8 tests fails** |
| Delete the current-label read + "already in sync" skip | **1 of 8 tests fails** |
| Month glob -> hardcoded `{YYYYMM}` | **2 of 8 tests fail** |
| `jq` `select()` in object-literal position | **1 of 8 tests fails** |

All five mutations are caught. The behavioural test is not shape-asserting theatre: it extracts the shell fragment from the real shipped `bkit-ship.md` (`reverseSyncShellBlock()` slices between the two comment headers — never a hand-copied duplicate), executes it under `/bin/bash` in a real `git init` repo against a 4-FID fixture ledger, and observes real stderr (`reverse-sync skip 300-gamma — live feat/{FID} branch`, `skip TEAM-42-delta — in-flight workflow phase event`). The two write-path defects live in orchestrator prose that no test can execute, so prose-regression guards on the **resolved** (`substituteWorkflow`) output are the correct ceiling there — and they hold.

**Test numbers, run by this verification (not quoted).** The first two full runs were red and the numbers are reported honestly, then explained:

- `pnpm test` run A: **22 failed | 2746 passed** across 8 files. Run B: **14 failed | 2758 passed** across 5 files.
- **All 36 of those failures are `Error: Test timed out in 5000ms` — zero assertion failures** (`grep -c "Test timed out"` equals the failure count in both runs). Every affected file is a subprocess-spawning integration test unrelated to sub-plan 2 (`bkit-install`, `bkit-check-opencode`, `bkit-upgrade`, `bkit-doctor`, `bkit-slop-type-suppression`, `bkit-workflow-telemetry-script`, `bkit-release-workflow`, `bkit-preflight-tracker-order`). Machine load average was **62.88 / 43.79** during those runs.
- `npx vitest run --testTimeout=90000 --hookTimeout=90000` (load artifact neutralised): **82 test files passed, 2772 passed | 2 skipped | 1 todo, 0 failed, exit 0.** The remediation log's claim is reproducible. Re-running the failing files in smaller batches also passes (`bkit-check-opencode` + `bkit-doctor`: 35/35).
- Sub-plan 2's five target files, isolated: **66/66 passed** (`bkit-roadmap-refresh-prompt`, `bkit-roadmap-sync.integration`, `bkit-roadmap-reconcile.integration`, `bkit-roadmap-staging.integration`, `bkit-ship-invariants`).
- `npx bats tests/roadmap-cadence.bats tests/telemetry-failopen.bats`: **19/19 ok.**
- `pnpm typecheck`: clean. `pnpm lint:prose`: 1 pre-existing warning (`docs/testing.md:318`), unrelated. `pnpm lint:slop`: exit 0. `pnpm format:check`: clean apart from this artifact.

Only four files changed since the attempt-2 verify commit (`564c3efe`): `bkit-roadmap-sync.integration.test.ts`, `bkit-ship.md`, and the two gitignores. Tasks 8/10/12 sources are untouched and re-verified green, so their attempt-2 `[x]` state stands.

**Checkbox state after this verification: unchanged.** Tasks 8–12 are all `[x]` and every `Done when` is now satisfied — Task 11's included, on the strength of the mutation evidence above rather than the remediation's assertion. The "This sub-plan's tests pass" bullet stays `[x]`. The "Local gate suite" bullet stays `[ ]` because its `pnpm bkit check` clause depends on sub-plan 3's batched `bkit install` (excluded from this verdict), and because the bullet names a `pnpm lint` script that does not exist in `package.json` (see Gap 4).

Excluded from the verdict per the task's scope instruction, confirmed still isolated: the `slop:delta` regression in `.bkit/src/bkit-telemetry-migrate.ts` (logged in `docs/failures.jsonl`, sub-plan 3); host-mirror drift / `bkit check` writes (no `bkit install` run); the three human-owned confirmation checkboxes; the recorded `counterSource: "shell-bus"` decision and the stale plan prose at lines 107/220 it created (sub-plan 3 Task 14).

**Verdict rationale.** Zero blocking defects: the deliverable is correct, tested against real behaviour, and mutation-proof for every defect attempt 2 identified. `CONCERNS` rather than `PASS` records five genuine non-blocking residuals below — none of which risks data loss, gates a close, or requires another build loop.

## Identified Gaps Log

5 gaps — 0 blocking, 2 medium, 3 informational.

**Gap 1 (MEDIUM, Task 11) — a `DEBUGGED` candidate strips the underlying phase label, contradicting debug's own additive doctrine.** `bkit-ship.md:1022` maps `DEBUGGED` -> `bkit:debug`, but every workflow header (`bkit-debug.md:38`, `bkit-ship.md:38`) declares `bkit:debug` **additive** — "Debug workflow active, additive — phase label persists" — and `bkit-debug.md:240/243` add it on top of the existing phase label. The reverse sync's replacement rule (`:1051`, drop `bkit:design|plan|build|ship|merged`, add `{RS.label}`) therefore turns `{bkit:build, bkit:debug}` into `{bkit:debug}` for a settled `DEBUGGED` FID. Non-blocking: it only fires for a FID with no live `feat/*` branch and no in-flight status log (rare right after a debug close), it destroys no additive/consumer labels, and the next build/ship close re-adds the phase label. Predates the remediation. Fix shape: treat `DEBUGGED` as additive — keep the prior phase label and add `bkit:debug`, or exclude `DEBUGGED` from the reverse-sync mapping entirely.

**Gap 2 (MEDIUM, Task 11) — candidate discovery is unbounded and does per-FID network work.** `:1011` iterates every `kind=="feature"` key in `docs/roadmap.jsonl` (50 distinct FIDs in this repo today, monotonically growing), and `:1012` runs `git ls-remote --exit-code --heads origin "feat/$RS_FID"` for each one whose local branch is absent — tens of network round trips per ship close, in a step that also then issues one MCP `issue_read` per surviving candidate. Correctness is unaffected (fail-open, never gates, and the drift gate means zero writes when in sync), but Step 10 gets slower on every ship and degrades badly offline. The PIVOT chose terminal-aware mapping over attempt 2's suggested "bound the candidate set to non-terminal statuses"; bounding discovery (e.g. skip `SHIPPED` FIDs older than the `## Shipped` window, or batch the branch check with a single `git ls-remote --heads origin 'feat/*'`) remains available as a follow-up.

**Gap 3 (INFO, Task 11) — the scratch file is created but not cleaned under `tracker: none`.** The discovery fence at `:1009-1038` sits outside every tracker marker, so `.bkit/.roadmap-reverse-sync-{FID}.json` is written even when no tracker is wired, while the `rm -f` cleanup at `:1067` renders only inside `<!-- bkit:tracker true -->`. The file is gitignored in both the repo and the shipped template, and the prose at `:1067` acknowledges this, so the residue is invisible to git — but a `tracker: none` consumer accumulates one stale file per ship.

**Gap 4 (INFO, plan text) — the Verification section names a script that does not exist.** `380-roadmap-analysis-refresh-plan-2.md:298` requires `pnpm lint`; `package.json` has no `lint` script (`pnpm lint` fails with `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL`, suggesting `lint:slop`). The equivalent real gates (`lint:slop`, `lint:prose`, `typecheck`, `format:check`) were all run and are clean. Worth correcting alongside the sub-plan 3 Task 14 plan-prose pass that already has to fix lines 107/220.

**Gap 5 (INFO, Tasks 9/10/12 — both carried unchanged from attempt 2).** (a) `bkit-roadmap-staging.integration.test.ts:194`'s title still claims the artifact is named "in the wait/assert list", but it only proves `roadmap-refresh.md` appears somewhere in Step 10 plus explicitly inside Gate 10; the real Step-4 wait/assert (`bkit-ship.md:1061`) is generic prose. Intent is met in substance. (b) `tests/roadmap-cadence.bats`, `bkit-roadmap-reconcile.integration.test.ts` and the new `telemetry-failopen.bats` cases source the `.bkit/templates/.bkit/scripts/…` copies, while this repo's own ship run sources the live `.bkit/scripts/…` copies; `diff` re-confirms all three pairs byte-identical today, but no test asserts that identity.

**Non-gap, recorded as an environment observation.** `pnpm test` at its default 5000 ms `testTimeout` is not reliably green on a loaded machine — 36 timeout-only failures across two runs at load average 43–63, all in subprocess-spawning integration files, all passing at a 90 s timeout or when run in smaller batches. This is pre-existing suite fragility, not a sub-plan 2 regression, but it is exactly the condition under which an executing agent can honestly believe a red run is green (or vice versa). Worth a `docs/knowledge.jsonl` entry or a raised per-file timeout for the `*-integration.test.ts` subprocess tier.
