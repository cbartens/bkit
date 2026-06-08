Verdict: CONCERNS
Failures: 5

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit.

## CRITICAL

### C1 — `.gitattributes` edit inside managed `bkit:start/end` block (rule #11 violation)

WS-1 architecture section states: "Inside the `bkit:start/end` markered block, add FOUR explicit scoped `merge=union` lines." The live `.gitattributes` (lines 1–21) shows every existing entry is inside the `# <!-- bkit:start -->` / `# <!-- bkit:end -->` comment block. Rule #11 forbids edits inside managed blocks — always edit below `bkit:end`. The four new data-file `merge=union` lines are bkit-repo-specific (Tier-2) and must be placed BELOW `# <!-- bkit:end -->`, not inside the block. The same applies to `.bkit/templates/.gitattributes`. The plan must be corrected to say "below the `bkit:end` marker."

Affected tasks: WS1-T4, WS1-T9 (where the template mirror is described).

### C2 — Matrix row missing for WS5-T2b (upgrade boundary safety test)

WS5-T2b is described as the mechanical pin that proves the destructive `.md` delete is unreachable from `bkit upgrade` — it is explicitly called out as the closure of the KN-8 regression vector and is a boundary integration test (filesystem/consumer repo). Despite being a full test task with a "Done when" criterion, there is no corresponding row in the Derived Test Matrix. The matrix ↔ runbook mapping is broken for this task. A row must be added: "Boundary: `bkit upgrade` over a fixture consumer with `.md` ledgers leaves all `.md` byte-identical + mtime-unchanged (filesystem stat); only explicit `bkit telemetry migrate` invocation deletes `.md` post-parity."

### C3 — Matrix row missing for WS1-T8 (per-workflow summary read)

WS1-T8 mandates a summary read step in every workflow that emits `malformedLineCount`, unknown-`schemaVersion` exclusions, and a `[bkit-telemetry]` `MAX_ROWS_BEFORE_ROLLUP` growth WARNING. There is no corresponding Derived Test Matrix row to drive a verification task. A row is needed (e.g., "Per-workflow summary read: `malformedLineCount`, unknown-`schemaVersion` exclusion count, and `MAX_ROWS_BEFORE_ROLLUP` WARNING appear in workflow output when thresholds are breached"), targeting a test that exercises these three output signals.

### C4 — `[DELETE]` architecture entries missing for `docs/knowledge.md`, `docs/decisions.md`, and `utility-harvest-friction` agent

The Supersession Inventory marks all three as DELETE, but the corresponding `[DELETE]` entries are absent from the Architecture & Component Changes sections:

- WS-5 section lists `[NEW]` data files and `[MODIFY]` of config files, but has no `[DELETE] docs/knowledge.md` or `[DELETE] docs/decisions.md` entries. The template requires each DELETE row in the Supersession Inventory to be mirrored as a `[DELETE]` entry in Architecture & Component Changes.
- WS-4 section describes `bkit harvest` CLI and analysis CLI but has no `[DELETE]` entry for the `utility-harvest-friction` agent prompt. The exact file path of that prompt is never stated in the plan, which also makes WS4-T5's "Done when" (`Grep` finds no live invocation) unverifiable without knowing the path.

### C5 — Matrix row missing for WS2-T6 close-gate wiring verification

WS2-T6's "Done when" criterion includes a grep-based structural assertion (every wired close gate contains the `|| echo` guard, no invocation sits under a bare `set -e` that defeats it). This is a distinct, independently-verifiable test of the wiring — not a restatement of the grader unit tests (WS2-T3/T4). No Derived Test Matrix row exists for it. This leaves the compliance-gate wiring unrepresented in the matrix, creating a gap where a missing or misconfigured guard on a single close gate would go undetected by the matrix-mapped tests.

---

## OPTIONAL

### O1 — WS4-T4 rollup writer has no dedicated matrix row

The archive rollup writer (`foldFrom` reads `.bkit/archive/{basename}.{YYYYMM}.jsonl` back) is tested implicitly by matrix row 8 ("foldFrom reads a synthetic archive shard"). However, the rollup WRITER — the code that actually writes to `ARCHIVE_SHARD_TEMPLATE` — has no matrix row asserting it produces a readable shard. Adding a row ("rollup writer produces a shard at `ARCHIVE_SHARD_TEMPLATE` that `foldFrom` reads back, row count preserved") would close this gap.

### O2 — WS1-T6 inline-jq workflow writers have no dedicated matrix row

Six workflow files receive telemetry append blocks. The inline-jq parity matrix row (row 6) covers parse correctness but not that EVERY workflow file has the append block and ALL A2-mandatory fields set. The "Done when" for WS1-T6 uses a `Grep` check rather than an automated test. A matrix row asserting A2-envelope completeness across all five workflow files via a grep-based test (similar in spirit to WS3's `bkit-counter-prose-audit.test.ts`) would make this machine-verifiable rather than relying solely on agent grep.

### O3 — WS4-T5 `utility-harvest-friction` file path unspecified

The plan refers to "the `utility-harvest-friction` agent prompt" but never states its path. If this file does not exist under the expected path, WS4-T5's "Done when" grep check will vacuously pass. The plan should state the exact path (likely `.agents/prompts/utility-harvest-friction.md`) and the Architecture section should include `[DELETE] .agents/prompts/utility-harvest-friction.md`.

### O4 — Human confirmation checkboxes unchecked; Gate 1 is blocked

Both `👤 Acceptance Scenario confirmed` and `👤 Breaking Changes confirmed` checkboxes are `[ ]`. The plan's own Gate 1 instruction says agents MUST NOT proceed past Gate 1 until these are `[x]`. This is the intended human-review gate, not a plan defect, but an executing agent would be stalled at Gate 1. If execution is imminent, these must be checked first.

### O5 — WS3-T2 per-mode bats coverage added by review but no matrix row

The plan (as reviewed) expanded WS3-T2 to require mode-matched counter scenarios (DEBUG/NORMAL/SOAK) in `counter-bus.bats`. Matrix row 17 describes the counter bus generically ("counter_init/inc/get/reset/check_max + decide_next exit codes/branch routing") without explicitly naming per-mode coverage. If the bats test reviewer treats row 17 as the mapping, per-mode coverage might be treated as optional. Tightening the matrix row to mention mode-matched scenarios closes a verification ambiguity.

---

## OUT OF SCOPE

### S1 — `docs/pending.md` row in `.agents/docs.md` not yet updated

The live `.agents/docs.md` still references `docs/pending.md` (line 44 in Workflow Matrix, line 99 in Full Catalog) rather than `docs/deferrals.jsonl`. This is in-scope for WS-1 (WS1-T9 sweeps legacy-ledger references), so it is a WS-1 execution concern, not a plan authoring gap. Noted here only so it is not confused with a plan defect.

### S2 — Rollup trigger value and archive committed-vs-gitignored decision

Both are explicitly deferred to WS-4 as OPEN QUESTIONs. The plan is correct to defer them. No plan change needed.

### S3 — #183 GitHub-API historical backfill scope

Explicitly deferred to WS-4 plan. Correct handling; no plan change needed.
