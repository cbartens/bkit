Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Plan Summary

## Verdict

CONCERNS

- plan-review CONCERNS
- plan-apply-review CONCERNS
- 3 deferral(s) written this run

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| plan-start-workflow | - | - | 1 | - |
| plan-worktree-setup | - | - | 1 | `docs/plans/202610/logs/700-session-start-nudge/plan-input-1.md` |
| plan-generate | - | - | 1 | `docs/plans/202610/logs/700-session-start-nudge/plan-v1-draft.md`, `docs/plans/202610/logs/700-session-start-nudge/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202610/logs/700-session-start-nudge/related-deferrals.md`, `docs/plans/202610/logs/700-session-start-nudge/related-failures.md`, `docs/plans/202610/logs/700-session-start-nudge/related-issues.md` |
| plan-review | CONCERNS | 8 | 1 | `docs/plans/202610/logs/700-session-start-nudge/plan-review-1.md`, `docs/plans/202610/logs/700-session-start-nudge/plan-review-2.md`, `docs/plans/202610/logs/700-session-start-nudge/plan-scope-check.md` |
| plan-apply-review | CONCERNS | - | 1 | `docs/plans/202610/logs/700-session-start-nudge/plan-v2-reviewed.md`, `docs/plans/202610/logs/700-session-start-nudge/plan-update-check.md` |

## Acceptance Scenario

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Testable feature contract — implementation, tests, verification derive from what you confirm here. Wrong here → wrong downstream.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). Agent handles rest.

### Narrative

`AGENTS.md` (and `CLAUDE.md` / `GEMINI.md`) only **point** at `.agents/rules.md` ("Read `.agents/rules.md` → follow all rules"). Nothing loads it, and nothing checks the agent read it. Hooks are the only enforcement layer today, and the only `SessionStart` hook (`bkit-preflight.sh`) self-skips on IDE sessions (it bails unless `LINEAR_ISSUE_ID` is set). A recent miss (an issue filed with a >70-char title and other rule violations) happened because `.agents/rules.md` was never read.

Source: `#700` `### Narrative`, verbatim (owner-supplied; no design and no audit report).

### Success Criteria

`#700` `### Success Criteria`, verbatim:

- On session start, every supported platform delivers an advisory naming `.agents/rules.md` as required reading before any other action.
- The wording asks only for `.agents/rules.md`; it never asks for `AGENTS.md`.
- The advisory never blocks a session and never errors the host (fail-open).
- Present across all providers: Claude Code, Cursor, opencode, Codex, Google Antigravity.

### Process Sketch

- **WHEN** a Claude Code session starts, IDE or cloud **→ THEN** `SessionStart` writes one JSON document whose `additionalContext` names `.agents/rules.md`, before the agent acts.
- **WHEN** a Cursor session starts **→ THEN** `sessionStart` writes `{ "additional_context": … }` naming `.agents/rules.md`, and the hook exits 0 (never blocks).
- **WHEN** an opencode, Codex or Antigravity session makes its first tool call **→ THEN** that host's hook delivers the same advisory once, on the host's own channel (opencode appends to the tool result, Codex `additionalContext`, Antigravity deny-once).
- **WHEN** the same session makes a further tool call **→ THEN** the advisory is not repeated.
- **WHEN** a cloud `bkit-preflight.sh` session also runs the Linear guard **→ THEN** the advisory and the guard result share one JSON document.
- **IF** the hook payload is malformed or empty **→ THEN** the hook exits clean — no error, no block.
- **IF** `.agents/rules.md` is missing **→ THEN** the advisory still names the file and nothing crashes.

### Concrete Example

**Setup:** A developer has a bkit repo checked out and opens a fresh Claude Code IDE session (no `LINEAR_ISSUE_ID`), then a fresh opencode session in the same repo.

**Steps:**

1. Developer starts the Claude Code session → the `SessionStart` hook writes one JSON document whose `additionalContext` reads `[bkit] Read .agents/rules.md before any other action and follow all its rules.`, and exits 0.
2. Developer asks the agent to do anything → the agent reads `.agents/rules.md` first, because the advisory is in its context.
3. Developer starts an opencode session and makes its first tool call → the opencode plugin appends the same advisory to that call's tool result, once.
4. Developer makes a second tool call → no advisory is appended.

**Outcome:** every session opens with one advisory naming `.agents/rules.md` and nothing else, on every host; no session is blocked and no host errors.

### Edge Cases

`#700` `### Edge Cases`, verbatim, plus plan-added validation / error / boundary cases:

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Platform exposes no session-start event | Advisory emitted at the first available pre-action point, or the gap documented with rationale |
| Cloud / background session (`LINEAR_ISSUE_ID` set) | Existing preflight still runs; rules advisory is also emitted |
| Malformed or empty hook payload | Fail-open — no error, no block |
| `.agents/rules.md` missing | Advisory still names the file; no crash |
| Claude or Cursor SessionStart carries both the advisory and the Linear guard result | One JSON document only — Claude discards stdout holding two documents, so the host hook accumulates context and writes once at exit |
| Cursor IDE session, `python3` absent (`failClosed: true`) | Advisory still written via a non-`python3` path; hook exits 0 — the session is never blocked |
| Second tool call in an opencode / Codex / Antigravity session | No second advisory — emitted once per session (per-session dedup) |
| Antigravity session (deny-once is its only model channel) | The first tool call is denied once with the advisory as its reason; the repeated call proceeds — the session is not blocked |
| hook payload arrives with no session id | Advisory emitted as for an unknown session; still fail-open |

## Open Questions

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Unknowns + assumptions this plan relies on. Unresolved question = risk; wrong assumption breaks downstream. If none, write "None".

- **Open Question:** exact advisory wording (short, imperative) — settled here. → resolved by this plan, human confirms.
  - **Options:** A — `[bkit] Read .agents/rules.md before any other action and follow all its rules.` (one line, names only `.agents/rules.md`, is quote/backslash-free so a `printf` path can emit it JSON-safely) · B — `[bkit] Required reading: .agents/rules.md` (terser, states the fact but not the timing) · C — `[bkit] Before any other action, read .agents/rules.md and follow all its rules.` (imperative-first, longer).
  - **Recommended:** A — it names the file, states "before any other action", is one line, and is safe to emit without a JSON encoder.
  - **Default if unanswered:** A.
- **Open Question:** which hosts lack a session-start event and where the advisory lands instead — settled here. → resolved by this plan, human confirms.
  - **Options:** A — Claude Code (`SessionStart`) and Cursor (`sessionStart`) get it at session start; opencode, Codex and Antigravity have no session-start event wired in bkit, so a dedicated per-host hook emits it at the first tool call, once per session (documented) · B — emit on Claude Code and Cursor only and document the other three as a gap · C — emit on all five from the existing GateGuard hook on the first edit.
  - **Recommended:** A — meets "present across all providers" and "before any other action" as closely as each host allows, without changing the GateGuard per-file contract.
  - **Default if unanswered:** A.
- **Assumption:** the advisory is purely additive to `bkit-preflight.sh`; no change to the existing Linear / cloud guards. → if wrong, the cloud-session hard-stop and Linear label/state guards (`bkit/core/hooks/preflight-linear.sh`) must be re-verified for every host, and the existing `preflight-sh.integration.test.ts` guard assertions become the blast radius.
- **Assumption:** the two `SessionStart` hosts accept one JSON document per hook run, so the advisory and any guard result must be merged before writing. → if wrong (two documents accepted), the accumulate-plus-`EXIT`-trap rewrite is unnecessary, but the merged form still passes.
- **Assumption:** Cursor's `failClosed: true` blocks only on a non-zero hook exit, so an advisory-only skip path that builds JSON without `python3` and exits 0 never blocks a Cursor IDE session. → if wrong, Cursor IDE sessions could be blocked by a missing dependency; mitigate by keeping the printer dependency-free.
- **Assumption:** opencode, Codex and Antigravity expose a first-tool hook bkit can register (opencode `tool.execute.before`/`execute.after`; Codex and Antigravity `PreToolUse`). → if wrong on a host, that host's row in `Documentation Updates` records the gap with its rationale (the `#700` Edge Case allows this).
- **Assumption:** Codex resolves a `PreToolUse` matcher literally against the tool name, so the new Codex hook registers as two single-value groups (`apply_patch`, `Bash`) — the shape every shipped Codex matcher uses in `.bkit/shared/.codex/hooks.json` — rather than one alternation. → if wrong, only the alternation form is valid and the second group is redundant, losing no behaviour; if instead Codex ignores a matcher it does not recognise, the hook installs, exits 0 and never fires (`docs/failures.jsonl` key `codex-read-tier-gates-not-wired-file-read-tool-name-unverified` records that trap), so the Codex half of Success Criterion 4 is unenforced — no planned test sees it, because every Codex test spawns the rendered hook directly — and the live check in `Manual Verification` Step 2 is the only proof.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #700
```

Or, to address the reasons first: `/bkit-plan #700`
