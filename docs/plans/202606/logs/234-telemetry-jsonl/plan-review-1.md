Verdict: CONCERNS
Failures: 2

<!-- verdict:end -->

# Plan Review

Lens: Tightness, scope discipline, design-coverage.

Overall: a tight, well-scoped plan with strong design fidelity. The five workstreams map 1:1 onto the locked P1-P5 phasing, the dependency DAG is preserved, addenda A1-A7 are all reflected, and every Derived-Test-Matrix row has a runbook task with a terse, codebase-verifiable `Done when`. No scope creep beyond what the design specifies. The findings below are gaps in coverage/tightness, not drift — none rise to plan-blocking once the two CRITICAL items are patched.

## CRITICAL

**C1 — `run-outcome` WRITE path has no test row, no write task, and no `Done when`.** The design Data Model defines `kind:"run-outcome"` (additions/deletions/net/files_changed/ci_first_try/corrective_commits/...) and Concrete Example step 2 says the ship close gate "appends a `kind:"run-outcome"` row." The Derived Test Matrix only has an analysis-side row that READS `run-outcome` rows (`bkit-analysis.test.ts`), and the runbook never tasks WRITING a `run-outcome` row at a close gate. WS1-T6 ("inline-jq close-step writers") speaks only of "attempt/failure-count rows" and `counterSource` counters; `run-outcome` is never named in any WS-1 (or WS-4) write task or `Done when`. Success Criterion #4 / #2 and the Concrete Example both depend on this row existing. Either (a) add a write task + `Done when` (which workflow close gate emits the `run-outcome` row, with which fields) and a parity/shape test row, or (b) explicitly assign it to WS-4 (it joins GitHub-API backfill) and state that WS-1 does NOT emit it. As written, the single most analytically load-bearing row (#183's whole substrate) has no owning task — an implementer could ship all five workstreams with green tests and never write a `run-outcome` row.

**C2 — `step` envelope field (A2) is unverified and absent from every `Done when`.** Addendum A2 makes `step` MANDATORY on EVERY row, and the plan's Data Schema Integration section correctly lists it. But no runbook task asserts it: WS1-T1 `Done when` enumerates exports (`fold`/`foldFrom`/`parse`/`validate`/identity/constants) but not the envelope fields; WS1-T2 `Done when` pins fold/identity/parse/schemaVersion but not that `validate` requires `step` (or the other A2-mandatory fields `repo`/`bkitVersion`/`schemaVersion`) on every row. Because A2's rationale is that count-only harvest slices by `repo`/`workflow`/`step`/`subagent`/`severity`, a row missing `step` silently breaks the dimensional harvest that WS-4 is built on. Patch: add to WS1-T1 or WS1-T2 `Done when` an explicit assertion that `validate(event)` rejects a row missing any A2-mandatory envelope field (`ts`/`kind`/`repo`/`bkitVersion`/`schemaVersion`/`step`), and that the inline-jq writers (WS1-T6 `Done when`) emit `step`. Without this, the A2 "mandatory dimensional envelope" decision is documented but never enforced or tested.

## OPTIONAL

**O1 — Design OQ "Legacy `.md` ledger fate post-migration" has no explicit resolve-task.** The design Open Questions list this; addendum A5 effectively resolves it for knowledge/decisions (destructive delete after parity) and Supersession Inventory resolves friction/pending (DELETE, history optionally ported). So it is resolved, not dropped — but unlike the other five OQs it is not surfaced as a `Resolve … OPEN QUESTION` line, so a reader cross-checking design OQs against the plan may flag it as missing. Add one sentence noting A5 + Supersession close it.

**O2 — WS1-T5 "history optionally ported" leaves the friction/pending migration scope ambiguous.** WS1-T5 says "Clean break (new `ts` ids; moved legacy ids → `aliases[]`)" and its `Done when` only checks the `.md` files are deleted and `.jsonl` equivalents exist — it does NOT require any existing entries to be ported, nor a parity check (unlike WS5-T2/T3 which are parity-gated). For friction/pending this is defensible per the design ("may start fresh"), but the `Done when` should state explicitly whether porting is in or out of scope so plan-verify does not tick the box against an empty `.jsonl` while live friction history is silently dropped. Tighten the `Done when` to "either seeded-empty (fresh-start, explicitly chosen) OR ported with `aliases[]`."

**O3 — Three OPEN QUESTIONs are decision-gated but their resolution is not a precondition on the dependent build task.** WS2-T1 (entrypoint/namespace), WS4-T3 (#183 backfill scope), WS4-T4 (rollup trigger value + commit-vs-ignore) each record a decision in `Done when`, which is good. But the entrypoint decision (WS2-T1) is declared by the design as a HARD gate "before the first read/grade verb ships," and WS2-T5 (`comply` CLI plumbing) does not name WS2-T1 as a precondition in its `Done when`. Add an explicit ordering note that WS2-T5/WS2-T6 must not start until WS2-T1 is recorded.

**O4 — WS3-T1 reconciliation `Done when` writes its note to "the WS-3 plan log," a delete-eligible location.** The reconciliation against the `dev`-local `mode-matched attempt counters` change is the highest-risk pre-flight in the plan (control-flow fork risk across 5 workflows). A note in a delete-eligible log may not survive. Consider recording the reconciliation outcome in `docs/decisions.md` (then `.jsonl`) alongside the other WS-2/WS-4 decisions, for durability.

**O5 — WS1-T6 `Done when` parity check is asserted in prose but not bound to a specific test file.** It says "a parity check confirms a row written by the workflow jq parses under `bkit-telemetry.parse`," but the Derived Test Matrix maps inline-jq parity to `bkit-telemetry.test.ts` (a synthetic jq row, not a row extracted from the actual workflow file). These are subtly different guarantees — the matrix tests the jq EXPRESSION, WS1-T6 implies testing the row as embedded in the workflow `.md`. Clarify whether WS1-T6's parity is the same `bkit-telemetry.test.ts` assertion or a distinct workflow-extraction test; if the latter, add a matrix row + target file.

**O6 — `MAX_ROWS_BEFORE_ROLLUP` initial value (~5,000) remains "to confirm in WS-1" but no WS-1 task `Done when` confirms it.** WS1-T7 emits the growth WARNING but its `Done when` does not require the constant's value to be locked. Minor: add "the `MAX_ROWS_BEFORE_ROLLUP` value is set (not left as a TODO)" to WS1-T7 `Done when`.

## OUT OF SCOPE

- **Per-rule grader expansion beyond `no-mirror-edit` / `skip-ci-not-head`.** The plan correctly ships the smallest-first 2-rule set (WS2-T3) and defers a fuller rule table; do not expand the rule set in this plan.
- **A human-facing telemetry renderer / dashboard.** Correctly excluded (Out of Scope). Any suggestion to add a viewer belongs in a follow-up.
- **Mass `KN-`/`DE-` retrofit of the ~1,460 references.** Correctly excluded via `aliases[]` + generated lookup table; keep it out.
- **Locking/concurrency control for telemetry writes.** Correctly out of scope (single-clone serialisation assumed); do not add file-locking.
- **`pass^k` offline grader fixture tier.** Correctly excluded per locked decision #6; do not introduce.
