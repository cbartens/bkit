## Session Prompt — this run's, newer than everything below

# Session prompt:

#700

---

# Plan Feature (Workflow 2/5)

**Role:** Orchestrator managing workflow with subagents.
**Scope:** Create plan in `docs/plans/{YYYYMM}/` (canonical month bucket, discovered or set at start) — no code, no execution.

**Protocol:** Work through this file exactly as written.

## Issue description — oldest

### Narrative

`AGENTS.md` (and `CLAUDE.md` / `GEMINI.md`) only **point** at `.agents/rules.md` ("Read `.agents/rules.md` → follow all rules"). Nothing loads it, and nothing checks the agent read it. Hooks are the only enforcement layer today, and the only `SessionStart` hook (`bkit-preflight.sh`) self-skips on IDE sessions (it bails unless `LINEAR_ISSUE_ID` is set). A recent miss (an issue filed with a >70-char title and other rule violations) happened because `.agents/rules.md` was never read.

**Ideas explored**

1. **Session-start advisory nudge.** Inject a directive at session start to read `.agents/rules.md` before acting. Soft; no blocking; works wherever a session-start event exists.
2. **First-action deny gate.** Deny `Edit` / `Write` / `Bash` until a read is observed (GateGuard before-hook + ReadGuard's per-session read log). Hard guarantee, but Claude Code `SessionStart` cannot block, and it needs a shared gate across every host.
3. **Content-hash acknowledgement.** Stamp the `rules.md` hash at read time; force a re-read when it changes. Correct but more machinery; pairs with #2.
4. **Provider auto-load.** opencode `instructions` config / Claude `CLAUDE.md` `@` imports auto-include the rules as context. Most reliable "read", but spends context budget every session.

**Decision:** ship **idea 1 only** — a soft, advisory session-start prompt that asks the agent to read **`.agents/rules.md`**, on **all platforms**. It asks for `.agents/rules.md` **only, never `AGENTS.md`** — all rules live in `rules.md`, and `AGENTS.md` is a pointer/router. Ideas 2–4 are recorded here as future work, out of scope for this change.

### Success Criteria

- On session start, every supported platform delivers an advisory naming `.agents/rules.md` as required reading before any other action.
- The wording asks only for `.agents/rules.md`; it never asks for `AGENTS.md`.
- The advisory never blocks a session and never errors the host (fail-open).
- Present across all providers: Claude Code, Cursor, opencode, Codex, Google Antigravity.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Platform exposes no session-start event | Advisory emitted at the first available pre-action point, or the gap documented with rationale |
| Cloud / background session (`LINEAR_ISSUE_ID` set) | Existing preflight still runs; rules advisory is also emitted |
| Malformed or empty hook payload | Fail-open — no error, no block |
| `.agents/rules.md` missing | Advisory still names the file; no crash |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Session-start hook emits an advisory naming `.agents/rules.md` | unit | `.bkit/core/engine/audits/hooks/` (per-host hook test) |
| Advisory text never names `AGENTS.md` as required reading | unit | same |
| Malformed / empty payload exits clean (fail-open) | unit | same |

### Tasks

```text
<!-- bkit:group 1 start -->
### GROUP 1: Rules-read session-start advisory

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Add the shared rules-read advisory to the session-start preflight source
  - **UPDATE:** the shared preflight part in `.bkit/core/hooks/`: emit `additionalContext` asking to read `.agents/rules.md` before any action
  - **READ:** `.bkit/core/.claude/hooks/bkit-preflight.sh`, `.bkit/core/.cursor/hooks/bkit-preflight.sh`: current `emit_context` shape
  - **DONE WHEN:** both rendered hooks carry the advisory and never name `AGENTS.md`
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` the advisory names `.agents/rules.md` and not `AGENTS.md`
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Wire the advisory for the remaining hosts (opencode, Codex, Antigravity)
  - **UPDATE:** `.bkit/core/.opencode/plugin/`, Codex / Antigravity hook sources: emit the same advisory at their session-start (or first pre-action) point
  - **DONE WHEN:** each host's dogfood shows the advisory on a fresh session; hosts without a session-start event are documented
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` (or a sibling) the plugin emits the rules advisory without throwing
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** Document the guard in the provider + authoring references
  - **UPDATE:** `.bkit/providers.md` (hook ownership / behaviour): the rules-read advisory and its per-host delivery
  - **DONE WHEN:** `bkit check` drift stays clean after `bkit install`; `.bkit/providers.md` describes the advisory
  - **TEST FIRST:** `n/a — docs`
<!-- bkit:task 3 end -->
<!-- bkit:group 1 end -->
```

### Open Questions & Assumptions

- Exact advisory wording (short, imperative) — settle in plan.
- Which hosts lack a session-start event and where the advisory lands instead — settle in plan.
- Assumes the advisory is purely additive to `bkit-preflight.sh`; no change to existing Linear/cloud guards.

### Breaking Changes & Naming

- None. Additive advisory only; no config keys, no new flags, no removed behaviour.

### Out of Scope

- Ideas 2–4 (deny gate, content-hash acknowledgement, provider auto-load).
- Any change to `.agents/rules.md` content.
- Blocking behaviour of any kind — this ships advisory-only.

### References

- `.agents/rules.md` § Repo Authoring (edit source then mirror), § Tracker rules
- `.bkit/core/.claude/hooks/bkit-preflight.sh`, `.bkit/core/.cursor/hooks/bkit-preflight.sh` — the current `SessionStart` hook (`emit_context`, IDE self-skip via `LINEAR_ISSUE_ID`)
- `.claude/settings.json`, `.cursor/hooks.json`, `.opencode/opencode.json` — installed hook wiring
- `.bkit/core/hooks/gateguard-engine.js`, `readguard-engine.js` — the block primitive and per-session read log (context for the deferred ideas)
- `.bkit/providers.md` — hook ownership model
- Related: [#699 — Engine run completeness check + auto friction/failure on errors](https://github.com/cbartens/bkit/issues/699) (adjacent observability work, not a duplicate)

## Issue comment — posted 2026-10-26T03:24:06.000Z

Work done: filed this issue to document the session-start guard ideas and the decision from the prior discussion.

**Outcome**

- Documented ideas 1–4 (session-start nudge; first-action deny gate; content-hash acknowledgement; provider auto-load) and recorded the **decision: idea 1 only — soft, advisory, all platforms**.
- Scoped the read target to **`.agents/rules.md`** only — never `AGENTS.md` (it is a pointer/router; all rules live in `rules.md`).
- Body in the `change` shape; labels `enhancement` + `next:plan`; milestone **Workflow Optimisation**; project fields set (Status `Backlog`, Priority `Low`, Size `M`). No parent, no blockers.

**Links**: [cbartens/bkit#700 — Session-start nudge: read .agents/rules.md on every platform](https://github.com/cbartens/bkit/issues/700)
No files changed this turn (tracker-only).
