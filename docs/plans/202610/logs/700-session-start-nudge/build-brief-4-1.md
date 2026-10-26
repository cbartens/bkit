# Brief: group 4 — Challenge round 2 findings

Plan: Session-Start Rules-Read Advisory Implementation Plan

## Why and what

### Context & Goals

**Problem.** `AGENTS.md` (and `CLAUDE.md` / `GEMINI.md`) only **point** at `.agents/rules.md` ("Read `.agents/rules.md` → follow all rules"). Nothing loads it and nothing checks the agent read it. Hooks are the only enforcement layer today, and the only `SessionStart` hook (`bkit-preflight.sh`) self-skips on IDE sessions (it bails unless `LINEAR_ISSUE_ID` is set). A recent miss — an issue filed with a >70-char title and other rule violations — happened because `.agents/rules.md` was never read (`#700`).

**Goal.** On every supported platform (Claude Code, Cursor, opencode, Codex, Google Antigravity), deliver one soft, advisory session-start nudge that names **`.agents/rules.md` only, never `AGENTS.md`**, before any other action. The advisory never blocks a session and never errors the host (fail-open). Delivery rides each host's earliest event: `SessionStart` where the host has one (Claude Code, Cursor), and the first tool call where it does not (opencode, Codex, Antigravity).

**Inputs and precedence.** No design doc and no audit report — the issue body is a `change`-shape issue (`#700`), so its `Narrative`, `Success Criteria`, `Edge Cases`, `Derived Test Matrix`, `Open Questions & Assumptions`, `Breaking Changes & Naming` and `Out of Scope` are the spec, kept word for word; its `Tasks` are the spec, expanded into the runbook below (5 hosts, three new hook files, install wiring, docs). Two issue comments follow the body; neither changes scope, an end state or a test. The first (2026-10-26T03:24:06Z) records the decision (idea 1 only) and the tracker links. The second (2026-10-26T04:55:18Z) is newer than this plan and unblocks the build: the Step 2 `bkit steps finish` commit failure that aborted build run 1 is fixed — `addAllButCopied` no longer names a gitignored `bkit.workflows.worktree.copy` entry in its `:(exclude)` pathspec, so the copied `.bkit/.env` no longer fails every worktree commit — and failure row `worktree-copy-gitignored-file-breaks-commit` is CLOSED. The fix sits in this worktree; the commits are not yet pushed to origin.

**Related Issues:**

- `#700` — Session-start nudge: read `.agents/rules.md` on every platform (this issue; state not read — no tracker tool in this subagent)
- `#699` — Engine run completeness check + auto friction/failure on errors (state not read; adjacent observability work, not a duplicate)

---

### Narrative

`AGENTS.md` (and `CLAUDE.md` / `GEMINI.md`) only **point** at `.agents/rules.md` ("Read `.agents/rules.md` → follow all rules"). Nothing loads it, and nothing checks the agent read it. Hooks are the only enforcement layer today, and the only `SessionStart` hook (`bkit-preflight.sh`) self-skips on IDE sessions (it bails unless `LINEAR_ISSUE_ID` is set). A recent miss (an issue filed with a >70-char title and other rule violations) happened because `.agents/rules.md` was never read.

Source: `#700` `### Narrative`, verbatim (owner-supplied; no design and no audit report).

### Success Criteria

`#700` `### Success Criteria`, verbatim:

- On session start, every supported platform delivers an advisory naming `.agents/rules.md` as required reading before any other action.
- The wording asks only for `.agents/rules.md`; it never asks for `AGENTS.md`.
- The advisory never blocks a session and never errors the host (fail-open).
- Present across all providers: Claude Code, Cursor, opencode, Codex, Google Antigravity.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Ideas 2–4: first-action deny gate, content-hash acknowledgement, provider auto-load | `#700` declared them out of scope before work started; this change ships the soft advisory only | `#700` § Out of Scope; deferrals `700-first-action-deny-gate`, `700-rules-content-hash-acknowledgement`, `700-provider-auto-load-rules` |
| Any change to `.agents/rules.md` content | `#700` issue non-goal, declared out of scope before work started; the file's bkit block is engine-managed and its consumer section is consumer-owned, so there is no deferred work to remediate | `#700` § Out of Scope |
| Blocking behaviour of any kind | `#700` issue non-goal, declared out of scope before work started; the advisory never blocks, so there is no deferred work to remediate | `#700` § Out of Scope |

## Where it fits

- Group 1: Advisory delivery across the five hosts — done
  - TASK 1: Deliver the rules-read advisory at session start on Claude Code and Cursor — done
  - TASK 2: Deliver the advisory at the first tool call on opencode — done
  - TASK 3: Deliver the advisory at the first tool call on Codex and Antigravity — done
- Group 2: References and close-out — done
  - TASK 4: Document the advisory and its per-host delivery in the references — done
  - TASK 5: Refresh this repo's installed mirrors and close out — done
- Group 3: Challenge round 1 findings — done
  - TASK 6: The opencode plugin consumes the once-per-session advisory token before it knows it can deliver it, so a first tool call whose result is missing (or not `completed`) loses the advisory for the whole session — done
  - TASK 7: The exit-8 rollback removes the appended step row from the working tree but leaves it staged in the index, so "nothing written, nothing committed" is false and a later pathspec-less commit commits the row — done
- Group 4: Challenge round 2 findings — this group
  - TASK 8: Antigravity `bkit-rules.cjs` registers on `run_command`, so the deny-once store persists the first call's full shell command line — inline secrets included — in cleartext, world-readable, with no TTL — open
  - TASK 9: The hand-rolled `bkit_json_escape` leaves every control character except `\n` `\r` `\t` raw, so untrusted guard content carrying one yields an unparseable SessionStart document the host discards whole — silently dropping the Linear guard's HARD STOP with the advisory — open

## The work

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Antigravity `bkit-rules.cjs` registers on `run_command`, so the deny-once store persists the first call's full shell command line — inline secrets included — in cleartext, world-readable, with no TTL
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/hooks/antigravity-hook.js:63` · **Round:** 2
  - **DONE WHEN:** `adviseOnce` no longer stores the raw call signature — it writes and compares a one-way hash (e.g. SHA-256) of the signature, so no tool argument of any host hook rests on disk in cleartext; deny-once retry behaviour is unchanged on all three Antigravity hooks. Today `agCallSignature` keeps every non-label arg, so a first `run_command` call's `CommandLine` (e.g. `export AWS_SECRET_ACCESS_KEY=…`, `curl -H "Authorization: Bearer …"`) is written verbatim by `fs.writeFileSync(file, signature)` to `os.tmpdir()/bkit-antigravity-retry/rules.<session>.json` at default 0644, and the file is removed only when the identical call is retried — an agent that rephrases instead of retrying leaves it forever, readable by any local user on a multi-user host. The pre-existing GateGuard registered edit tools only (file paths); this diff's matcher `write_to_file|replace_file_content|view_file|run_command` (`.bkit/shared/.agents/plugins/bkit/hooks.json`, `.agents/plugins/bkit/hooks.json`) widens the at-rest exposure from paths to command lines.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` `the antigravity retry store never persists a raw command line` fails on the finding — spawn the rendered Antigravity hook with a `run_command` payload whose `CommandLine` carries a marker string; after the deny, `os.tmpdir()/bkit-antigravity-retry/rules.<safe>.json` contains the marker verbatim today, and the test asserts it does not (hashed form) while the identical retry is still allowed.

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** The hand-rolled `bkit_json_escape` leaves every control character except `\n` `\r` `\t` raw, so untrusted guard content carrying one yields an unparseable SessionStart document the host discards whole — silently dropping the Linear guard's HARD STOP with the advisory
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/.claude/hooks/bkit-preflight.sh:46` · **Round:** 2
  - **DONE WHEN:** `bkit_write_document` emits a document that parses for any byte the accumulated context can hold — the full U+0000–U+001F range is escaped (or the writer routes through a JSON encoder when one is on PATH, keeping the `printf` path as the no-`python3` fallback) — in both SessionStart templates and their rendered mirrors (`.bkit/core/.claude/hooks/bkit-preflight.sh:46`, `.bkit/core/.cursor/hooks/bkit-preflight.sh:44`, `.claude/hooks/bkit-preflight.sh`, `.cursor/hooks/bkit-preflight.sh`). Reproduced: `bkit_json_escape` on a context containing `\x0b` emits it raw and `JSON.parse` rejects the document ("Bad control character in string literal"). The content path is untrusted: the Linear guard interpolates the API's `identifier` / custom `state` / `labels` names and the env `LINEAR_ISSUE_ID` verbatim into `emit_context` (`.bkit/core/hooks/preflight-linear.sh:8,35,68,72`); the removed `python3 json.dumps` path escaped the full range, so this is a regression, and the diff's own knowledge row `kn-hooks-sessionstart-stdout-is-one-json-document` records that a rejected document drops bkit's whole output with a zero exit.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `a context carrying a control character still yields one parseable JSON document` fails on the finding — run the rendered Claude hook with `LINEAR_ISSUE_ID` carrying `\x0b` and no `BKIT_LINEAR_API_KEY` (the key-missing FAIL message interpolates the id verbatim); today `JSON.parse(result.stdout)` throws, and the test asserts the document parses and its context still contains the HARD STOP.

<!-- bkit:task 9 end -->
