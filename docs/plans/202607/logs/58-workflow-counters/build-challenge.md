Verdict: CONCERNS
Failures: 1

<!-- verdict:end -->

# Build Challenge

Canonical reconciliation of two parallel challenge reports for `58-workflow-counters`:

- `build-challenge-1.md` — correctness lens (null-safety, off-by-one, error paths, data integrity). Verdict CONCERNS, 0 CRITICAL, 2 LOW.
- `build-challenge-2.md` — security / exposure lens (shell-injection, data-integrity in counter-derivation path). Verdict CONCERNS, 1 HIGH.

## Reconciliation notes

- **No overlap to collapse.** Challengers probed disjoint surfaces: challenge-1 → shipped derivation scripts (`bkit-counter-bus.sh`, `bkit-status-fold.sh`) for correctness/fail-closed; challenge-2 → `bkit-debug.md` `debugAttempt` arithmetic path for injection. No shared `file:line`, no shared root-cause cluster — every finding single-lens, retained with attribution. Per multi-lens rule, single-input findings normal, not outvoted.
- **HIGH finding independently reproduced** by orchestrator (crafted `status.jsonl` marker `debugAttempt:"x[$(touch ...)]"` executes under bash via `$((PRIOR_DEBUG_ATTEMPT + 1))`). Confirmed, not alleged. Gated behind attacker-planted input → HIGH, not CRITICAL.
- Max severity = HIGH → canonical verdict **CONCERNS** → Step 11 remediation (`CHALLENGE_REMEDIATE_ATTEMPT` = 0). FAIL would over-grade gated, mechanically-fixable defect and route to Failure Path.

## Findings (ranked by what must be fixed)

### 1 — HIGH — mechanical — arithmetic-injection sink in the `debugAttempt` derive

Lens: security / exposure (challenge-2 Finding 1). agreement: 1/2.

Location — THREE `PRIOR_DEBUG_ATTEMPT` derive -> `$(( ))` pairs in `.bkit/workflows/bkit-debug.md`:

- `:189` derive -> `:190` `DEBUG_ATTEMPT=$((PRIOR_DEBUG_ATTEMPT + 1))`
- `:219` derive -> `:220` `DEBUG_ATTEMPT=$((PRIOR_DEBUG_ATTEMPT + 1))`
- `:364` derive -> `:365` `DEBUG_ATTEMPT=$((PRIOR_DEBUG_ATTEMPT + 1))`

Root cause: `... | last.debugAttempt // 0` reads RAW string field, not `.length` count. `// 0` defends only null/missing; jq `-r` on string prints verbatim (no error, no fallback to 0). Crafted `workflow-meta` row `{"type":"workflow-meta","workflow":"debug","debugAttempt":"x[$(cmd)]",...}` → verbatim in `PRIOR_DEBUG_ATTEMPT` → POSIX `$(( ))` recursively evaluates array subscript → EXECUTES command substitution.

Exploit: doctored `status.jsonl` (`docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, travels through git on feature branch) → maintainer runs `/bkit-debug` (Step 1 re-reads committed log on resume). Not same-run: normal writer emits `debugAttempt` via `--argjson da "$DEBUG_ATTEMPT"` (`:374`), rejects non-JSON. Vector: attacker-planted/corrupted log, or hallucinating subagent. Rated HIGH (confirmed code-exec, gated, not reachable via integer-constrained writers).

Empirically confirmed (bash 5.3.9 + macOS `/bin/sh`): `D=$((P + 1))` with `P="x[$(touch F)]"` creates `F` (code executes, `D=1`); `dash` fails closed; `zsh` no-exec. Workflow fenced blocks run under bash on Claude Code and GitHub `run:` steps.

Suggested fix (mechanical, no redesign — ALL THREE sink derives at `:189`, `:219`, `:364`): after each `PRIOR_DEBUG_ATTEMPT` derive, BEFORE `$(( ))`, add guard from `counter_count` / `check_max` / `decide_next` (`.bkit/scripts/bkit-counter-bus.sh:143,201,207,238,244`):

    case "$PRIOR_DEBUG_ATTEMPT" in '' | *[!0-9]*) PRIOR_DEBUG_ATTEMPT=0 ;; esac

OR coerce numerically in jq at derive:

    ... | (last.debugAttempt // 0) | if type=="number" then . else 0 end
    # or: ... | last.debugAttempt | tonumber? // 0

Completeness note (fix complete, not partial):

- THREE `$(( ))` pairs above are ONLY arithmetic sinks — grep: `DEBUG_ATTEMPT=$((` at exactly `:190`, `:220`, `:365`.
- SEVEN post-marker derives that DROPPED `+1` — `:432->:433`, `:567->:568`, `:593->:594`, `:616->:617`, `:631->:632`, `:675->:676`, `:704->:705` — read `last.debugAttempt // 0` into `DEBUG_ATTEMPT`, gate `[ "$DEBUG_ATTEMPT" -gt 0 ] || exit 2`. `test`/`[ -gt ]` NOT arithmetic expansion: rejects non-integer operand ("integer expected", rc=2), `|| exit 2` fails closed WITHOUT executing injected substitution (verified bash + `/bin/sh`). Seven sites need NO change. Guarding harmless (coerce-to-0 → `[ 0 -gt 0 ]` → exit 2, same outcome) but not required. Fixing three `$(( ))` sites closes sink fully.

### 2 — LOW — mechanical — empty `--sub-plan` degrades to "no filter" (ACCEPTED / non-blocking)

Lens: correctness (challenge-1 F1). agreement: 1/2.

Location: `.bkit/scripts/bkit-counter-bus.sh:126` (`--argjson sp "${_cc_subplan:-null}"`); consumers `.bkit/workflows/bkit-build.md:536,554,584,646`.

Scenario: passed-but-empty `--sub-plan ""` conflates with omitted flag → counts ALL sub-plans (over-count). Only if model substitutes `{SUB_PLAN}` empty; non-numeric already fail closed (jq argjson parse → exit 2).

Disposition — ACCEPTED, no remediation. Fail-safe (over-count → early stop / premature Failure Path, never silent overrun); challenger judged non-defect; `SUB_PLAN` provenance outside feature's "number's-provenance-moves" change. Recorded for deferrals discipline. Not counted in `Failures`.

### 3 — LOW / informational — architectural — resume run-boundary counter reset (ACCEPTED / non-blocking)

Lens: correctness (challenge-1 F2). agreement: 1/2.

Location: `.bkit/workflows/bkit-build.md:336-339` (`.[-1]`-last-run-overall resume guard).

Scenario: build IN_PROGRESS with spent budget → COMPLETED debug run → resumed → fresh build run, resets active-run build counters to fresh budget.

Disposition — ACCEPTED, no remediation. Challenger PROVED pre-existing (diff: only `FOLD` → `BKIT_STATUS_FOLD` rename), consistent with deliberate DE-25 active-run-scoping design, at most budget-over-permissive (never hard failure); triggering sequence operationally warned against ("No concurrent bkit workflows on one clone"). Not regression. Not counted in `Failures`.

## Verdict rationale

One HIGH, gated, mechanically-fixable defect (arithmetic-injection sink, three `$(( ))` sites) requires remediation → `Failures: 1`. Two LOW items accepted non-blocking (recorded for deferrals discipline, excluded from count). Max severity HIGH below CRITICAL → **CONCERNS** — routing to Step 11 remediation.
