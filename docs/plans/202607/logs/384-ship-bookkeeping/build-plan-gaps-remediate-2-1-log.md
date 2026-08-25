Verdict: PASS
Strategy: STANDARD

<!-- verdict:end -->

# Plan Gaps Remediation — Sub-Plan 2, Attempt 1

## Scope

`Single` — Sub-Plan 2 (`docs/plans/202607/384-ship-bookkeeping-plan-2.md`). Address the single non-blocking concern raised by `build-plan-verify-2-1.md` (Gap #1): Task 8 / SP2 Gate #5 "byte-identical" wording imprecision.

## Investigation

Re-read `384-ship-bookkeeping-plan-2.md`, `build-plan-verify-2-1.md`, and the status log. Confirmed the single non-blocking concern (Gap #1) directly against the worktree:

- **Literal `diff .bkit/workflows/bkit-ship.md .claude/commands/bkit-ship.md` → exit 1 (differs).** Source = 1288 lines carrying 156 `<!-- bkit:tracker {github,linear,true} start/end -->` markers for all trackers; rendered `.claude` mirror = 1102 lines with the configured tracker (github) resolved and markers stripped. The diff is non-empty **by construction**, not by implementation error.
- **`bkit check` → exit 0, zero `bkit-rendered-prompts-stale` advisories** (functional drift intent satisfied).
- **`bkit install --claude --cursor --opencode=zai` → exit 0, `0 write(s)`** (idempotent render — mirrors already correctly rendered).

**Conclusion:** The concern is genuinely plan wording only — no code or workflow file is incorrect. The plan's Task 8 Done-when and SP2 Gate #5 asserted a literal source↔mirror `diff ... empty (byte-identical)` that is never satisfiable because tracker template resolution is fundamental to bkit's mirror rendering. The functional intent (correctly rendered, drift-free, idempotent mirrors) is fully satisfied by the authoritative automated invariants. Remediation = documentation fix to the plan (and the same class of imprecise label in the "Rendered mirrors" section header), plus a `knowledge.jsonl` gotcha row so future agents don't re-introduce the wording.

## What was changed

**File:** `docs/plans/202607/384-ship-bookkeeping-plan-2.md` (planning doc — no source/test/workflow files touched).

1. **"Rendered mirrors (Task 8)" section** — added a `> [!NOTE]` block clarifying that "rendered ≠ byte-identical to source" (tracker template markers resolved at render time; authoritative drift check = `bkit check` + `bkit install` 0 writes). Updated the per-mirror parentheticals: `.claude` / `.cursor` / `.opencode` now annotated as "tracker-resolved" (with T1/T2/T3 noted for `.cursor`), and the snapshot annotated as "rendered↔rendered idempotency".
2. **Task 8 Done-when** — replaced the impossible `diff ... empty (byte-identical)` clause with: `bkit install` exits 0 with 0 writes (idempotent render) + `bkit check` reports no `bkit-rendered-prompts-stale` drift (authoritative check), with an inline note that the literal source↔mirror diff is non-empty by construction so a raw `diff` is not a valid Done-when.
3. **SP2 Gate heading** — `Hardened Rewrite + Byte-Identical Mirrors` → `Hardened Rewrite + Drift-Free Rendered Mirrors`.
4. **SP2 Gate checkbox #5** — `Mirrors byte-identical: diff ... empty` → `Mirrors correctly rendered (no drift)`: states the literal diff is non-empty by construction, with the authoritative check being `bkit check` + `bkit install` 0 writes, and clarifies "byte-identical" applies only to script root↔template pairs (Task 6) + the snapshot, NOT source↔mirror.

**Deliberately untouched (correct as-is):** Line 85 (script root↔template pairs are genuinely byte-identical — confirmed by verify + `bkit-dogfood-noop` 7/7); line 129/132 snapshot wording (rendered↔rendered idempotency).

**File:** `docs/knowledge.jsonl` — appended `knowledge` row `rendered-mirror-diff-nonempty-by-construction-tracker-resolution` (symptom → root cause → remediation) so future plan/verify steps word mirror-drift checks correctly.

## Test results

Plan-wording + knowledge-row change only — no source/test/workflow files modified, so test surfaces are unaffected by construction. Re-ran the full gate loop to confirm no regression:

<!-- prettier-ignore -->
| Gate | Result |
| --- | --- |
| `typecheck` | exit 0 (clean) |
| `test` (vitest) | exit 0 — **2616 passed / 2 skipped / 1 todo** (matches verify baseline exactly) |
| `format:check` | exit 0 (all pass) |
| `lint:slop` | exit 0 |
| `lint:prose` | exit 0 — **0 errors / 1 warning** (same pre-existing non-fatal warning as verify baseline) |
| `test:bats` (SP2 carrier) | exit 0 — **140/140 GREEN** (matches verify baseline) |
| `bkit check` | exit 0 — no `bkit-rendered-prompts-stale` drift |
| `bkit install --claude --cursor --opencode=zai` | exit 0 — **0 writes** (idempotent) |

## Verdict rationale

The single concern (Gap #1) is fully resolved: the plan now accurately describes what "correctly rendered / no drift" means in the rendered context, the impossible source↔mirror byte-identity claim is removed from both Task 8 Done-when and SP2 Gate #5, the gotcha is recorded for future agents, and all local gates pass (no regression — this was a documentation-only change). There are no remaining gaps for Sub-Plan 2.

## Remediation Log

DONE — Gap 1: Task 8 / SP2 Gate #5 "byte-identical" wording imprecision — corrected plan wording in `docs/plans/202607/384-ship-bookkeeping-plan-2.md` so source↔mirror byte-identity is no longer asserted; the authoritative drift check (`bkit check` no `bkit-rendered-prompts-stale` + `bkit install` 0 writes) is stated instead, with a NOTE explaining tracker template resolution. Also recorded the gotcha in `docs/knowledge.jsonl`.
