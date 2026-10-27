# Brief: group 3 — Challenge round 1 findings

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
- Group 3: Challenge round 1 findings — this group
  - TASK 6: The opencode plugin consumes the once-per-session advisory token before it knows it can deliver it, so a first tool call whose result is missing (or not `completed`) loses the advisory for the whole session — open
  - TASK 7: The exit-8 rollback removes the appended step row from the working tree but leaves it staged in the index, so "nothing written, nothing committed" is false and a later pathspec-less commit commits the row — open

## The work

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** The opencode plugin consumes the once-per-session advisory token before it knows it can deliver it, so a first tool call whose result is missing (or not `completed`) loses the advisory for the whole session
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/.opencode/plugin/bkit-rules.js:63` · **Round:** 1
  - **DONE WHEN:** both drivers check the delivery shape _before_ calling `rulesReadAdviceOnce()` — V2 `if (!event || event.status !== "completed" || !event.result) return;` and V1 `if (!output || typeof output !== "object") return;` ahead of the consume — so a call that cannot carry the advisory leaves the session token unconsumed and the next call delivers it, exactly as `bkit-gateguard.js` (`bkitGateGuardAfterV2`/`…V1`) and `bkit-readguard.js` (`bkitReadGuardAfterV2`/`…V1`) already do.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` `opencode plugin keeps the advisory for the next call when the first result is missing` fails on the finding — today the first `execute.after` event with no `event.result` returns `""` **and** consumes the token, so the second (well-formed) call also returns `""`; the test asserts the second call carries `.agents/rules.md`.
    - `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` `the 1.x driver keeps the advisory when the first output is not an object` fails on the finding — the V1 hook with a non-object `output` consumes the token and never appends it.

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** The exit-8 rollback removes the appended step row from the working tree but leaves it staged in the index, so "nothing written, nothing committed" is false and a later pathspec-less commit commits the row
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/steps.ts:470` · **Round:** 1
  - **DONE WHEN:** the `rec === null` branch's rollback (the `addAllButCopied(cwd)` + `runGit(cwd, ["commit", "--allow-empty", …])` path at `steps.ts:493-499`, whose failure calls `rollback()` at `:496`) also restores the index entry it staged, so after an exit-8 the index matches the rolled-back working tree and no later commit can carry the row. Verified reproduction: `git add -A` then a pre-commit hook that exits 1 leaves `status.jsonl` staged; removing the working-tree file leaves `git status --porcelain` reporting `AD status.jsonl` and a pathspec-less `git commit` still commits the row. The `rec !== null` branch is already safe — `commitOwnSet` unstages on failure (`ledgers.ts:613-620`) — so only the worktree path needs the unstage.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `a failed commit leaves no row staged in the index` fails on the finding — after the exit-8 path (`reports a failed commit with exit 8 without writing the row`, whose pre-commit hook exits 1) the test asserts `git(cwd, ["diff", "--cached", "--name-only"])` does **not** list the `status.jsonl` row.

<!-- bkit:task 7 end -->
