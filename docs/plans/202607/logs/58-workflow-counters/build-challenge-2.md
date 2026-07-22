Verdict: CONCERNS
Failures: 1

<!-- verdict:end -->

# Build Challenge 2 — Security / Exposure Lens

Lens: shell-injection and data-integrity in counter-derivation path (jq fold + shell `case`/arithmetic over `status.jsonl`). No network/auth/DB surface — web-OWASP findings deliberately not manufactured. Every finding backed by run against SHIPPED scripts with hostile fixture.

## Finding 1 — HIGH — mechanical — arithmetic-injection sink in the `debugAttempt` derive

Location: `.bkit/workflows/bkit-debug.md:189-190`, `:219-220`, `:364-365` (all three `PRIOR_DEBUG_ATTEMPT` derive → `DEBUG_ATTEMPT=$((PRIOR_DEBUG_ATTEMPT + 1))` sites; derive lines and `$(( ))` lines `+`/modified in this diff — fold var renamed `$FOLD` → `$BKIT_STATUS_FOLD`, arithmetic re-emitted).

RAW FIELD read, not `.length` count:

```
PRIOR_DEBUG_ATTEMPT=$(jq -s -r "$BKIT_STATUS_FOLD"' fold | [.[] | select(.workflow=="debug")] | last.debugAttempt // 0' "$SRC" ...)
DEBUG_ATTEMPT=$((PRIOR_DEBUG_ATTEMPT + 1))
```

`// 0` defends only null/missing — NOT non-integer STRING. jq `-r` on string SUCCEEDS (prints raw string, no error, no fallback to 0) → crafted `workflow-meta` row `{"type":"workflow-meta","workflow":"debug","debugAttempt":"x[$(...)]",...}` lands verbatim in `PRIOR_DEBUG_ATTEMPT` → POSIX arithmetic recursively re-evaluates → array-subscript command substitution EXECUTES.

Repro (shipped `bkit-status-fold.sh`):

- fixture: `debugAttempt:"x[$(touch /tmp/ARITH_PWNED 1>&2)]"`
- derived `PRIOR_DEBUG_ATTEMPT=[x[$(touch /tmp/ARITH_PWNED 1>&2)]]`
- `D=$((P + 1))` by shell:
  - **bash → `/tmp/ARITH_PWNED` created (code executed), `D=1`**
  - **`/bin/sh` (macOS) → created (code executed), `D=1`**
  - `dash` → aborts "Illegal number" (fail-closed)
  - `zsh` → no exec (1-based subscript)
    Workflow fenced blocks run under bash on Claude Code and `bash` on GitHub `run:` steps — executing case is live; dash only safe interpreter.

Feature's own gap, not pre-existing noise: this change set added `case "$_val" in '' | *[!0-9]*) ... return 2` to `counter_count`, `check_max`, `decide_next` (verified tight). `PRIOR_DEBUG_ATTEMPT → $(( ))` is same "derive counter from status.jsonl, then use it" pattern on lines this diff touches, but never routes through that guard. Fail-CLOSED everywhere except here → fails OPEN into code-exec sink — direct contradiction of acceptance intent.

Exploitability (honest): NORMAL writer safe — every `debugAttempt` via `--argjson da "$DEBUG_ATTEMPT"` (`bkit-debug.md:374`); `--argjson` rejects non-JSON. Sink requires EXTERNALLY planted row: doctored `status.jsonl` committed on feature branch (`docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, travels through git) → maintainer runs `/bkit-debug` (resume re-reads committed log at Step 1). Malicious-branch / corrupted-log vector, not same-run trigger — low but non-trivial bar in local dev tool. Hallucinating subagent hand-writing malformed `debugAttempt` also trips it. Rated HIGH (confirmed code-exec, gated behind attacker-controlled input, not reachable via feature's integer-constrained writers). Reviewer treating git-committed `status.jsonl` as untrusted input could escalate to CRITICAL.

Suggested fix (mechanical, no redesign): after each `PRIOR_DEBUG_ATTEMPT` derive, before `$(( ))`, add counter-bus guard:
`case "$PRIOR_DEBUG_ATTEMPT" in '' | *[!0-9]*) PRIOR_DEBUG_ATTEMPT=0 ;; esac` (or numeric-only helper). Optionally tighten jq:
`... | (last.debugAttempt // 0) | if type=="number" then . else 0 end`.

## Probed and found SAFE (no finding)

- **jq injection via `status.jsonl` string content** (item 1): NOT possible. All model/attacker strings via `--arg`/`--argjson` (data-only); fold is fixed constant; jq parses file as JSON — `step` named `evil$(touch X)` counts as data (count=1, NO file created). Malformed JSON → jq errors → `counter_count` rc=2, empty stdout (fail-closed).
- **counter-bus fail-closed guards** (items 2/3): `check_max`/`decide_next`/`counter_count` reject every hostile value — `''`, `1; rm -x`, `1 -o 1`, `0x10`, `1e3`, `x[$(id)]`, `-5`, `+5`, `decide_next` array-injection payload — all → rc=2, stderr diagnostic, no stdout, no command executed. `case '' | *[!0-9]*)` airtight against every non-pure-digit string. (22-digit all-digit passes guard → benign "number truncated" in `[ -gt ]` — not exploitable.)
- **`counter_next` `$((_cn_val + 1))`**: safe — `_cn_val` only when `counter_count` returned 0 (integer guard passed). Status field `x[$(id)]` cannot reach `$(( ))` — `counter_next` derives `.length` (int), never field value.
- **Provenance integrity — `shell-bus` claim** (item 4): HONEST. All six emitters (`bkit-{build,debug,ship,design,plan}.md`) derive `COUNTER_VALUE` via `jq -s '[... workflow-started ...] | length'` guarded by `case '' | *[!0-9]*) COUNTER_VALUE=1`, emit `--argjson counterValue "$COUNTER_VALUE" --arg counterSource "shell-bus"`. No residual hardcoded `--argjson counterValue 1` under `shell-bus` label — T7.1 applied. Label denies "model-supplied number"; value genuinely fold-derived count.
- **Secrets / env / mirror exposure** (item 5): no tokens, keys, JWTs in diff. `.bkit/templates/.bkit/.env.example` change is documentation only (empty `OPENCODE_API_KEY=`). `.bkit/version` carries no secret. Only absolute `/Users/christian/` paths in two build-LOG artifacts (`build-input.md`, `prose-violations.txt`) — local run output, cosmetic, NOT in shipped script or render mirror.

## State

Probed real fixtures + shipped scripts in scratchpad; fixtures deleted. Repo `git status` clean bar own artifact and peer `build-challenge-1.md`. No source files modified.
