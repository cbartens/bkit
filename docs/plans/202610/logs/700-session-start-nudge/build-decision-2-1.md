Status: DECIDED
Question: CHALLENGE
From: challenge
Pause step: 10
Plan: docs/plans/202610/700-session-start-nudge-plan.md

**Q1 — TASK 8 [.bkit/core/hooks/antigravity-hook.js:63]:** The Antigravity deny-once store writes the first `run_command` call's full shell command line (inline secrets included) in cleartext to `os.tmpdir()/bkit-antigravity-retry/rules.<session>.json` at 0644 with no TTL, readable by any local user until an identical retry. Shall it be fixed now by persisting a one-way hash of the call signature instead? Yes = Fix now.
Options: Accept / Fix now
Recommended: Fix now — Cheap and mechanical (hash the signature); this diff's `run_command` matcher widened the at-rest exposure from file paths to command lines, and deny-once behaviour is unchanged.
Decision: Fix now — fix now

**Q2 — TASK 9 [.bkit/core/.claude/hooks/bkit-preflight.sh:46]:** `bkit_json_escape` leaves every control character except `\n` `\r` `\t` raw, so untrusted Linear guard content (API `state`/`labels` names, `LINEAR_ISSUE_ID`) carrying one makes the single `SessionStart` JSON document unparseable — the host discards it whole, silently dropping the Linear guard's `HARD STOP` along with the advisory. Shall it be fixed now by escaping the full U+0000–U+001F range in both `SessionStart` hooks and their rendered mirrors? Yes = Fix now.
Options: Accept / Fix now
Recommended: Fix now — Mechanical fix restoring the range the removed `python3 json.dumps` path escaped; the failure mode silently drops a security guard on a cloud session.
Decision: Fix now — fix now

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
