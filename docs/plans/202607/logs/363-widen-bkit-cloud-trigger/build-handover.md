# Debug Abort Handover

## The Short Version

This build widens bkit's cloud auto-agent trigger to also watch the `dev` branch after a PR merges, so a failure caught right after merging gets an automatic fix attempt instead of going unnoticed. The plumbing for that is built and mostly sound, but the one wire that actually turns the feature on — carrying a "please auto-route this" marker onto the merge commit — is broken by a JavaScript-style variable-scoping mistake in the shell scripts, so the feature is currently a no-op. One remediation attempt already fixed several other real bugs but missed this one and also forgot to re-publish the fix into the copies of the workflow that actually run in the cloud.

## What's Actually Happening

Symptom: post-merge `dev` CI failures never trigger the intended `/bkit-debug` auto-dispatch. Trigger: the free-tier gate in `bkit-cloud.yml` requires `bkit [auto route]` literally present in the squash-merge commit subject. Proximate cause: `bkit-ship.md` Step 5 (`.bkit/workflows/bkit-ship.md:686-704`) never actually appends that suffix — it tries to read a handoff variable/file (`BKIT_AUTO_ROUTE_FILE`) set at Step 1 (`:255-262`) via `$GITHUB_ENV`, but falls back to a dead `${LABELS:-}` read (`:696`) that is always empty by the time Step 5 runs. Root cause (design fragility): `$GITHUB_ENV` only propagates a variable **between separate GitHub Actions workflow steps**; inside `claude-code-action`/`opencode run`, an agent's Bash tool calls are all inside one Action step, so the file written at Step 1 never becomes visible at Step 5 in a real cloud dispatch. Contributing factor: `.claude/`, `.cursor/`, `.opencode/` mirrors of `bkit-ship.md` and `bkit-auto.md` were never regenerated after the first remediation pass, so even a correct fix in `.bkit/workflows/` would not reach the artifacts the runner executes.

## Rot Signals

None (this abort originates from `build-challenge-reconcile`, not a debug diagnose attempt).

## Out-of-Scope Recommendations

None captured beyond what is already logged as deferrals (see Reference Docs) — `docs/deferrals.jsonl:55` (main-branch trigger reversal) and `:56` (dispatch-cap self-resettable, key `363-dev-dispatch-cap-self-resettable-by-controlled-principal`), both already recorded and out of scope for this abort.

## Attempt History

| Strategy                                                                                  | What was tried                                                                                                                                                                                                                                                                         | Why it failed                                                                                                                                                                                                       |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| build-plan-execute (4 verify/remediate cycles)                                            | Implemented trigger widening, ctx-step FID recovery, loop cap, `fix/**` folding                                                                                                                                                                                                        | Reached PASS at `build-plan-verify` attempt 4                                                                                                                                                                       |
| build-challenge attempt 0 → CRITICAL                                                      | Found `/bkit-ship` was feat/-only (fix/** success mis-routed to ship), FID lacked slug allowlist, `AUTO_ROUTE_SUFFIX` marker-threading was dead code (`${LABELS:-}` never assigned)                                                                                                    | FAIL, 1 CRITICAL escalation                                                                                                                                                                                         |
| build-challenge-remediate attempt 1 (STANDARD, the ONE allowed attempt)                   | Fixed fix/** ship no-op guard, FID slug allowlist (both bkit-cloud.yml and bkit-auto.md), fork-origin guard, fail-closed counter write, exact-match kill-switch, and "fixed" the marker handoff via a `mktemp` + `$GITHUB_ENV` file-path handoff (mirroring `bkit-debug.md:1258-1264`) | Verdict CONCERNS; all local tests/lint green — but the `$GITHUB_ENV` handoff idiom does not survive across Bash tool calls within a single cloud Action step (root cause above), and mirrors were never regenerated |
| build-challenge attempt 1 (fresh re-run) → CONCERNS (0 local failures)                    | Re-verified the remediation                                                                                                                                                                                                                                                            | Individual lenses missed the cross-tool-call defect; only reconcile caught it                                                                                                                                       |
| build-challenge-reconcile attempt 1 → FAIL, 1 CRITICAL (F1) + HIGH (F2) + 9 more (F3–F11) | Reviewer independently reproduced the `set -euo pipefail` abort and traced `$GITHUB_ENV` semantics; confirmed via `git log -1` that all 3 host mirrors of `bkit-ship.md`/`bkit-auto.md` still carry pre-remediation content                                                            | Feature confirmed functionally inert; `MAX_CHALLENGE_REMEDIATE_ATTEMPT=1` exhausted → abort                                                                                                                         |

## Verified Resolutions (DO NOT ROLL BACK)

- `fix/**` CI-success no longer mis-routes to `/bkit-ship` (ctx-step `else` arm, both jobs) — F1 of the first challenge, reconfirmed clean in the second pass.
- FID slug allowlist enforced in `bkit-cloud.yml` at all 4 sites (`:229,:316,:412,:429` per remediate-log) — reconfirmed clean.
- Fork-origin `head_repository == github.repository` job-level gate — reconfirmed clean, though F4 (below) notes a residual same-repo-but-untrusted-PR-body gap in the fallback FID lookup.
- Exact-match `grep -qxF 'bkit:auto'` kill switch (was unanchored substring) — reconfirmed clean.
- Fail-closed counter write with `git show origin/dev:` verification (P6) — reconfirmed clean.
- Version bump 4.10.0 → 4.11.0, consistent across `package.json` / `.bkit/version` — reconfirmed clean.
- `docs/deferrals.jsonl:55` (main-branch exclusion) and `:56` (self-resettable cap) — correctly recorded, keep as-is.

## Persistent Errors

- **F1 (CRITICAL)** — `.bkit/workflows/bkit-ship.md:255-262,686-704` (+ stale mirrors `.claude/commands/bkit-ship.md:583-587`, `.cursor/commands/bkit-ship.md:580-584`, `.opencode/commands/bkit-ship.md:586-590`). The marker is never emitted on any path in any runtime; `bkit-cloud.yml:113`'s `contains(head_commit.message, 'bkit [auto route]')` gate can never match a `dev` push. Reproduced: `bash -c 'set -euo pipefail; f(){ . /nonexistent; [ "$X" -ge 1 ]; }; f || echo handled'` class of failure is analogous — variable never set in the executing shell.
- **F2 (HIGH)** — `.claude/commands/bkit-auto.md:75-88` (and `.cursor/`, `.opencode/` equivalents) still lack the M2 CI_DEV FID slug assert present in `.bkit/workflows/bkit-auto.md:103-105`; confirmed by direct read (mirror jumps straight from `FID="$ARG"` to `ISSUE_ID=...` with no assert, still carries the removed `PR_URL="(merged)"` sentinel). `git log -1`: source `2f75142c`, `.claude/commands/bkit-auto.md` at `16dbb299` (pre-remediation).
- F3–F11 (MEDIUM/LOW, `docs/plans/202607/logs/363-widen-bkit-cloud-trigger/build-challenge.md`) are secondary — unreachable `|| true` fail-safe (F3), fork-PR-body FID spoofing risk (F4), stale consumer-facing docs re: `fix/**` (F5), best-effort dropped-dispatch telemetry (F6), kill-switch consulted after a write (F7), commit-body vs subject scan for FID (F8), nondeterministic month-bucket `find` (F9), unguarded `source` fail-open (F10), self-resettable cap doc gap (F11, already deferred).

## Recommended Next Steps

1. **Delete the cross-call `$GITHUB_ENV` handoff; re-derive in the same fence used at Step 5.** ✅ Fixes F1 at the root (no state needs to cross a tool-call boundary). ❌ Does not fix F2 (mirror regen) or F3–F11. ⚠️ Low effort (~10-line change), matches the challenge's own suggested fix and `docs/knowledge.jsonl:70` (key `363-workflow-md-shell-var-does-not-survive-bash-tool-call-boundary`): `AUTO_ROUTE_SUFFIX=""; gh issue view {ISSUE_ID} --json labels --jq '.labels[].name' 2>/dev/null | grep -qxF 'bkit:auto' && AUTO_ROUTE_SUFFIX=" bkit [auto route]" || true` inside the Step 5 merge fence.
2. **Regenerate all host mirrors (`.claude/`, `.cursor/`, `.opencode/`) via `bkit install`/`bkit upgrade` and diff-verify against `.bkit/workflows/`.** ✅ Fixes F2 (and re-propagates fix #1 once applied). ❌ Does not fix any logic bug on its own. ⚠️ Mechanical, near-zero risk; must be the LAST step before re-challenge (mirror drift is not caught by branch-scoped `bkit check`).
3. **Also note:** `bkit-debug.md:1258-1264` carries the exact same broken `$GITHUB_ENV`-handoff idiom (pre-existing, not introduced by #363) — worth a follow-up issue/fix once #1 confirms the pattern, since it affects the same marker-threading contract from a different call site.
4. **Fix F3–F11 in the same remediation pass** (all mechanical, no architectural work) before re-running `build-challenge`. ✅ Closes the remaining findings the second challenge pass raised. ❌ None of them block the core F1 fix. ⚠️ Moderate — ~9 small independent patches; batch them with #1/#2 since they touch the same files.

## Recommended Path

Option 1 + 2 together, in order (fix the handoff root cause, then regenerate mirrors so the fix is actually executable), is the minimum to unblock a second `build-challenge` run. Fold in option 4 (F3–F11) in the same pass since they're all mechanical and already fully specified with suggested fixes in `build-challenge.md` — bundling avoids a third full challenge/remediate/reconcile cycle. A fresh session should start `build-plan-gaps-remediate`-style (not another `build-challenge-remediate`, since that attempt budget is exhausted) or re-enter the build workflow from a corrected sub-plan.

## Reference Docs

- `docs/plans/202607/363-widen-bkit-cloud-trigger-plan.md` (v4, PASS) — design intent, Task list, Option A rationale.
- `docs/plans/202607/logs/363-widen-bkit-cloud-trigger/status.jsonl` — full step ledger; last rows: `build-challenge-reconcile` FAIL attempt 1 (`10:48:09Z`), `workflow-failed` (`10:48:38Z`).
- `docs/plans/202607/logs/363-widen-bkit-cloud-trigger/build-challenge.md` — reconciled F1–F11 findings (second pass), reviewer-reproduced evidence.
- `docs/plans/202607/logs/363-widen-bkit-cloud-trigger/build-challenge-remediate-log.md` — first remediation pass (18 items DONE, 1 BLOCKED as L2/architectural).
- `docs/plans/202607/logs/363-widen-bkit-cloud-trigger/build-challenge-1.md`, `build-challenge-2.md` — individual lens reviews (bugs/edge-cases, security) feeding both reconcile passes.
- `docs/knowledge.jsonl:70` (key `363-workflow-md-shell-var-does-not-survive-bash-tool-call-boundary`) — the general pattern behind F1, with both fix idioms named (one of which — file+`$GITHUB_ENV` — is now proven insufficient for cloud dispatch).
- `docs/deferrals.jsonl:55` (`363-main-branch-trigger-excluded-reversal`), `:56` (`363-dev-dispatch-cap-self-resettable-by-controlled-principal`) — accepted, unrelated to this abort.
- `docs/failures.jsonl` — two new rows appended by this handover (see below).
