## Session Prompt — this run's, newer than everything below

#700

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

## Issue comment — posted 2026-10-26T04:55:18.000Z

Unblocked. The Step 2 `bkit steps finish` commit failure that aborted build run 1 is fixed on local `dev` (commit `412fe612f`), and its failure row is closed (`fd110763e`).

`addAllButCopied` no longer names a gitignored `bkit.workflows.worktree.copy` entry in its `:(exclude)` pathspec, so the copied `.bkit/.env` no longer fails every commit in the worktree. Full list of changes and verification evidence is on #662 — Debug can't start after failed ship: leftover files block rebase (https://github.com/cbartens/bkit/issues/662).

The build can be re-run once the commits are pushed. Not yet pushed to origin.

## Plan — docs/plans/202610/700-session-start-nudge-plan.md — last committed 2026-10-26T11:10:57.000Z

<!-- bkit:anchor
baseSha: 471abbc369f348a12cbc6c1a6a0907e698cca328
baseRef: origin/dev
bkitVersion: 6.0.0
bkitLatest: 6.0.0
-->

Verdict: CONCERNS
<!-- verdict:end -->

<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). `{YYYYMM}` = creation month, set once by the first workflow run for `{FID}`. Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. The canonical copy is stamped with a `bkit:anchor` block recording the base commit (`baseSha`), its ref (`baseRef`), and the design it targets (`designPath`, `designBaseSha`); never hand-author or edit it. `@bkit-plan-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

# Session-Start Rules-Read Advisory Implementation Plan

> [!CAUTION]
> **Purpose:** Implementation plan — pre-flight, gates, runbook, verification, rollback.

## Context & Goals

**Problem.** `AGENTS.md` (and `CLAUDE.md` / `GEMINI.md`) only **point** at `.agents/rules.md` ("Read `.agents/rules.md` → follow all rules"). Nothing loads it and nothing checks the agent read it. Hooks are the only enforcement layer today, and the only `SessionStart` hook (`bkit-preflight.sh`) self-skips on IDE sessions (it bails unless `LINEAR_ISSUE_ID` is set). A recent miss — an issue filed with a >70-char title and other rule violations — happened because `.agents/rules.md` was never read (`#700`).

**Goal.** On every supported platform (Claude Code, Cursor, opencode, Codex, Google Antigravity), deliver one soft, advisory session-start nudge that names **`.agents/rules.md` only, never `AGENTS.md`**, before any other action. The advisory never blocks a session and never errors the host (fail-open). Delivery rides each host's earliest event: `SessionStart` where the host has one (Claude Code, Cursor), and the first tool call where it does not (opencode, Codex, Antigravity).

**Inputs and precedence.** No design doc and no audit report — the issue body is a `change`-shape issue (`#700`), so its `Narrative`, `Success Criteria`, `Edge Cases`, `Derived Test Matrix`, `Open Questions & Assumptions`, `Breaking Changes & Naming` and `Out of Scope` are the spec, kept word for word; its `Tasks` are the spec, expanded into the runbook below (5 hosts, three new hook files, install wiring, docs). Two issue comments follow the body; neither changes scope, an end state or a test. The first (2026-10-26T03:24:06Z) records the decision (idea 1 only) and the tracker links. The second (2026-10-26T04:55:18Z) is newer than this plan and unblocks the build: the Step 2 `bkit steps finish` commit failure that aborted build run 1 is fixed — `addAllButCopied` no longer names a gitignored `bkit.workflows.worktree.copy` entry in its `:(exclude)` pathspec, so the copied `.bkit/.env` no longer fails every worktree commit — and failure row `worktree-copy-gitignored-file-breaks-commit` is CLOSED. The fix sits in this worktree; the commits are not yet pushed to origin.

**Related Issues:**

- `#700` — Session-start nudge: read `.agents/rules.md` on every platform (this issue; state not read — no tracker tool in this subagent)
- `#699` — Engine run completeness check + auto friction/failure on errors (state not read; adjacent observability work, not a duplicate)

---

## 👤 ⚠️ Acceptance Scenario

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

### Derived Test Matrix

`Type` = a tier from `docs/testing.md`: Static, Unit, Integration, @live (golden), E2E, fresh-DB replay, Smoke. The first three rows are `#700` `### Derived Test Matrix`, verbatim (their `unit` label and `.bkit/core/engine/audits/hooks/` target are the issue's own words). Rows 4+ are plan-added; every one spawns a rendered hook or reads the rendered sources, so each is `Integration` — the tier `docs/testing.md` § Key test files records for the sibling `audits/hooks/*` files and the tier its `*.integration.test.ts` name declares. `Task` maps each row to exactly one runbook task.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Session-start hook emits an advisory naming `.agents/rules.md` | unit | `.bkit/core/engine/audits/hooks/` (per-host hook test) | 1 |
| Advisory text never names `AGENTS.md` as required reading | unit | same | 1 |
| Malformed / empty payload exits clean (fail-open) | unit | same | 3 |
| Claude IDE session (empty `LINEAR_ISSUE_ID`) writes the advisory in `additionalContext` and exits 0 | Integration | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` | 1 |
| Claude cloud session writes one JSON document carrying both the advisory and the Linear guard result | Integration | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` | 1 |
| Cursor `sessionStart` writes `additional_context` with the advisory without `python3` and exits 0 | Integration | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` | 1 |
| opencode plugin appends the advisory to the first tool result and not to a second call in the same session | Integration | `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` | 2 |
| opencode plugin fails open (no throw) on a malformed or empty hook input | Integration | `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` | 2 |
| The shared advisory constant names `.agents/rules.md` and not `AGENTS.md` | Integration | `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` | 2 |
| The shell part and the JS part hold the byte-identical advisory string | Integration | `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` | 2 |
| Codex hook writes the advisory once as `additionalContext` and fails open on an empty payload | Integration | `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` | 3 |
| Antigravity hook denies the first tool call once with the advisory as its reason, then allows the retry | Integration | `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` | 3 |
| Every rendered advisory hook names `.agents/rules.md` and never `AGENTS.md` | Integration | `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` | 3 |
| An unknown session id (payload carries none) still yields the advisory once and never throws | Integration | `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` | 3 |

### 👤 ✅ Human Confirmation

- [x] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Review proposed names and breaking changes below.

**Breaking changes:** `#700` `### Breaking Changes & Naming`, verbatim: _None. Additive advisory only; no config keys, no new flags, no removed behaviour._

**New names** (files bkit adds; all advisory-only, no public contract):

- `.bkit/core/hooks/preflight-rules.sh` — shared shell part holding the advisory string for the two `SessionStart` hosts.
- `.bkit/core/hooks/session-rules-advisory.js` — shared JS part holding the advisory string and the once-per-session helper.
- `.bkit/core/.opencode/plugin/bkit-rules.js` — opencode first-tool advisory plugin.
- `.bkit/core/.codex/hooks/bkit-rules.cjs` — Codex `PreToolUse` advisory hook.
- `.bkit/core/.agents/plugins/bkit/hooks/bkit-rules.cjs` — Antigravity `PreToolUse` advisory hook.

Installed mirrors gain the same basenames under `.opencode/plugin/`, `.codex/hooks/` and `.agents/plugins/bkit/hooks/`; the existing `.bkit/providers.md` hook table is extended, not renamed.

### 👤 ✅ Human Confirmation

- [x] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

---

## 👤 ⚠️ Open Questions & Assumptions

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

### 👤 ✅ Human Confirmation

- [x] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

- **Extend the GateGuard engine on the three non-session-start hosts** (fold the advisory into `bkitGateguard(payload)`). Rejected: it changes GateGuard's per-file first-touch return value and the behaviour table asserted by `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts`; the first edit would stop being a clean per-file checklist.
- **Emit on Claude Code and Cursor only, document the rest as a gap.** Rejected: fails the "present across all providers" success criterion.
- **Provider auto-load (opencode `instructions`, `CLAUDE.md` `@` import)** — `#700` idea 4. Rejected for this change: spends context budget every session and is recorded as future work (`docs/deferrals.jsonl` key `700-provider-auto-load-rules`).
- **First-action deny gate** — `#700` idea 2. Rejected: Claude Code `SessionStart` cannot block and no shared gate exists across hosts; recorded as `700-first-action-deny-gate`.
- **Content-hash acknowledgement** — `#700` idea 3. Rejected: needs the deny gate's per-session read log first; recorded as `700-rules-content-hash-acknowledgement`.
- **Single-source the advisory sentence, so the shell part and the JS part cannot drift** (one part read by the other, or the sentence registered in `.bkit/instructions.md` § Hook Text through `HOOK_SOURCES`). Rejected: render-time parts are inlined into each host template by `renderParts` (`.bkit/core/engine/render/parts.ts`) and never shipped, so no runtime cross-language read exists; and `hookMessages` (`.bkit/core/engine/tools/instructions-sources.ts`) lifts only a literal opening `[bkit <Word>]`, `bkit … guardrails:` or `Blocked`, which the settled `[bkit] …` wording does not match, so the store could not hold this sentence without changing the human-confirmed wording. The two copies are held together instead by the matrix row `The shell part and the JS part hold the byte-identical advisory string` (Task 2).
- **Recommendation for a future phase:** once the deny gate's per-session read log exists, add a content-hash acknowledgement so a changed `.agents/rules.md` forces a re-read; and widen `HOOK_SOURCES` / `MESSAGE_START` so a `[bkit]`-prefixed hook message can live in the store.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Ideas 2–4: first-action deny gate, content-hash acknowledgement, provider auto-load | `#700` declared them out of scope before work started; this change ships the soft advisory only | `#700` § Out of Scope; deferrals `700-first-action-deny-gate`, `700-rules-content-hash-acknowledgement`, `700-provider-auto-load-rules` |
| Any change to `.agents/rules.md` content | `#700` issue non-goal, declared out of scope before work started; the file's bkit block is engine-managed and its consumer section is consumer-owned, so there is no deferred work to remediate | `#700` § Out of Scope |
| Blocking behaviour of any kind | `#700` issue non-goal, declared out of scope before work started; the advisory never blocks, so there is no deferred work to remediate | `#700` § Out of Scope |

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| Engine run completeness check + auto friction/failure on errors | `#699` | observability of the hooks this plan touches (`docs/observability.md`, hook fail-open behaviour) | keep deferred — `#700` names it adjacent, not a duplicate |
| ReadGuard nudge: point build agents at their group brief | `docs/decisions.jsonl` key `668-readguard-nudge-out-of-scope` | the same "a hook nudges the agent" advisory surface, on Claude-only hooks | keep deferred — owner ruled it out of `#668`; needs per-host equivalents first |
| Decoupled preflight posture (MCP actions toolset) | `docs/decisions.jsonl` key `341-c1-c2-mcp-actions-toolset-and-decoupled-preflight-posture` | both `bkit-preflight.sh` hooks this plan edits | keep deferred — different concern (MCP scope); no criterion needs it |
| Issue-less Linear cloud session still hard-stops | `docs/deferrals.jsonl` key `650-preflight-linear-issue-less` (OPEN, LOW) | `.bkit/core/hooks/preflight-linear.sh`, the file Task 1 declares `READ` | keep deferred — a Linear cloud agent is always launched from an issue |
| Codex read-tier gates not wired (file-read tool name unverified) | `docs/deferrals.jsonl` key `codex-read-tier-gates-not-wired-file-read-tool-name-unverified` (OPEN, MEDIUM) | the Codex `PreToolUse` surface Task 3 registers a new hook on — the same unverified tool-name knowledge the matcher assumption depends on | keep deferred — a security-tier change (deny `*.pem`, ask `.env`) of its own size; one probe could settle both, but not under this plan |
| Install advisory when the tracker resolves to none | `docs/deferrals.jsonl` key `504-install-advisory-when-tracker-is-none` (OPEN, MEDIUM) | install-advisory surface | keep deferred — no criterion here needs it |
| `bkit upgrade` silently replacing a drifted managed block | `related-issues.md` § Re-check of `aea3c813` (final residual) | this plan rewrites the managed block of both `bkit-preflight.sh` hooks and adds three markered-text hooks | keep as its own issue — nothing in `#700`'s criteria needs it |

## Security & Privacy

None — no new API routes, DB tables/columns, secrets, user input, redirects or webhooks. The advisory is a static constant: it interpolates no issue, tracker or user content, so it adds no untrusted-content surface. Every hook stays fail-open and exits 0.

## Pre-Flight / Dependencies

### Core

- [x] **Package Management:** no packages added or changed; `package.json` and `pnpm-lock.yaml` stay in sync untouched.
- [x] **Dependency Versions:** node `v24.16.0` (matches `.nvmrc` `24`), pnpm `10.34.6`. `pnpm bkit:deps:outdated` reports 5 outdated dev-only deps — `vitest` 5.0.3→5.0.5, `@vitest/coverage-v8` 5.0.3→5.0.5, `oxlint` 1.87.0→1.88.0, `@types/node` 24.19.2→26.6.5, `vite` 6.4.4→8.3.4. None blocks this change (no new deps; the `vite` major sits upstream of the vitest stack and is out of scope).
- [x] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory` (`grep -rn "rules\.md" .bkit/core .bkit/shared`, `grep -rln "additionalContext|additional_context" .bkit/core`, reads of the GateGuard / ReadGuard engines, every host hook template, and the slop-override / dogfood-template entries for the hook families).
- [x] **User Context:** file access confirmed (worktree `.worktrees/700-session-start-nudge`); no missing user information.
- [x] **Project Context:** read `.bkit/providers.md` § Hooks / § GateGuard / § ReadGuard, `docs/architecture.md` § Consumer Integration Model, `docs/testing.md` § "Which tier does a behaviour need?" and § Key test files, `docs/decisions.jsonl` keys `668-readguard-nudge-out-of-scope`, `gateguard-advisory-default-fail-open-pure-engine`, and the tests this plan turns red — `.bkit/core/engine/render/parts.test.ts`, `.bkit/core/engine/commands/install/check.integration.test.ts`, `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` — plus `slop-scan.config.json`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` and `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts`.
- [x] **Testing & Quality:** matches `docs/testing.md` — every plan-added row is `Integration`, the tier § Key test files records for the sibling `audits/hooks/*` files (a spawned-hook check plus a source-level assertion) and the tier the `*.integration.test.ts` naming rule declares. No DB, no external / deployed boundary → no `@live`, E2E or fresh-DB replay row.
- [x] **Prerequisite Plans:** None. The three new opt-in-host files reach an existing consumer on `bkit upgrade` only through the closed fix `upgrade-skips-new-optin-host-files` (an absent opt-in path is let through when that module is installed) — a regression of that path silently stops this advisory reaching installed consumers. Build run 1 aborted at Step 2 on failure `worktree-copy-gitignored-file-breaks-commit`; the issue's newest comment records it CLOSED and its fix (a gitignored `worktree.copy` entry stays out of `addAllButCopied`'s exclude pathspec) is in this worktree, so every task's commit can land.

### Conditional

- [x] **Secrets & Env Vars:** none added; the hosts' existing `LINEAR_ISSUE_ID` / `BKIT_LINEAR_API_KEY` and GateGuard / ReadGuard env vars are unchanged.
- [x] **Schema State:** N/A — no database.
- [x] **Architecture & UI:** `docs/architecture.md` § Installed layout hook list is updated with the new hook files; no UI.
- [x] **Observability:** no new logs or traces; hooks stay fail-open. Loudness rules for hook failures (`docs/observability.md`) are unchanged.
- [x] **Notifications:** None — no alert or toast.

### 🔒 Gate 1: Prerequisites Check

- [x] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`).
- [x] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`).
- [x] **Open Questions confirmed:** Human confirmed `👤 Open Questions & Assumptions` section (checkbox is `[x]`).
- [x] **Security & Privacy checked:** no applicable row; `None` justified above.
- [x] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision`; every `NEW` cites its reason.
- [x] **Gate 1 - Verified:** Core items and applicable Conditional items checked.

## Data Schema Integration

None — no database in this repo.

### Data Schema Usage

None.

### Data Schema Changes

None.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Canonical rules-read advisory text (shell) | `.bkit/core/hooks/preflight-rules.sh` | `grep -rn "rules\.md" .bkit/core .bkit/shared`; `grep -rn "emit_context" .bkit/core/.claude/hooks .bkit/core/.cursor/hooks`; `docs/capabilities.md` | None — no shell hook part holds a session-start context string; `preflight-linear.sh` holds only the Linear guard messages | NEW | (a) no candidate exists for a shared shell advisory string |
| Session-start emission, Claude Code + Cursor | `.bkit/core/.claude/hooks/bkit-preflight.sh`, `.bkit/core/.cursor/hooks/bkit-preflight.sh` | read both hooks in full; `grep -rn -e SessionStart -e sessionStart .bkit/core/engine .bkit/shared` | both hooks' `emit_context` (writes one document and exits) | EXTEND | splice the shared part before each IDE bail and make `emit_context` accumulate so the advisory rides the one document each host already writes |
| Canonical rules-read advisory text + once-per-session helper (JS) | `.bkit/core/hooks/session-rules-advisory.js` | `grep -rn -e firstTouchAdvice -e dedupKey -e alreadyWarned -e adviseOnce .bkit/core/hooks`; read `gateguard-engine.js`, `readguard-engine.js`, `antigravity-hook.js` | `gateguard-engine.js` dedup (per file), `readguard-engine.js` (per read), `antigravity-hook.js` (`adviseOnce`, per call) | NEW | (b) folding a session-level advisory into either engine changes its per-file / per-read return value and its callers — the five host hooks and `gateguard-parity.integration.test.ts` / `readguard-parity.integration.test.ts` assert that value |
| First-tool advisory, opencode | `.bkit/core/.opencode/plugin/bkit-rules.js` | read `.bkit/core/.opencode/plugin/bkit-gateguard.js` and `bkit-readguard.js`; `grep -n "plugin" .bkit/core/engine/install/modules/opencode.ts` | `bkit-gateguard.js` (edit tools only), `bkit-readguard.js` (read / shell only) | NEW | (b) both plugins are scoped to edit / read tools and their tests assert that scope; a session-start advisory is a third concern with its own fire point |
| First-pre-action advisory, Codex | `.bkit/core/.codex/hooks/bkit-rules.cjs` | read `.bkit/core/.codex/hooks/bkit-gateguard.cjs`; `cat .bkit/shared/.codex/hooks.json` | `bkit-gateguard.cjs` (`apply_patch` only), `bkit-readguard.cjs` (`Bash` only) | NEW | (b) extending either hook changes its registered-matcher behaviour, asserted by `gateguard-parity.integration.test.ts` / `readguard-parity.integration.test.ts` |
| First-pre-action advisory, Antigravity | `.bkit/core/.agents/plugins/bkit/hooks/bkit-rules.cjs` | read `.bkit/core/.agents/plugins/bkit/hooks/bkit-gateguard.cjs`; `cat .bkit/shared/.agents/plugins/bkit/hooks.json` | `bkit-gateguard.cjs` (`write_to_file` only), `bkit-readguard.cjs` (`view_file` only) | NEW | (b) same as Codex — the existing hooks' matchers and deny-once behaviour are asserted by the parity tests |
| Hook registration + install wiring | `.bkit/shared/.opencode/opencode.json`, `.bkit/shared/.codex/hooks.json`, `.bkit/shared/.agents/plugins/bkit/hooks.json`, `.bkit/core/engine/install/modules/opencode.ts`, `codex.ts`, `antigravity.ts`, `.bkit/core/engine/install/manifest.ts` | read all six files; `grep -n -e bkit-gateguard -e bkit-readguard .bkit/core/engine/install/manifest.ts` | the existing GateGuard / ReadGuard registration blocks in each file | EXTEND | add the new hook basename beside the existing two in each config, module and manifest entry |
| Slop opt-outs + dogfood template edits for the new hook family | `slop-scan.config.json`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | `grep -n -e bkit-gateguard -e bkit-readguard -e bkit-guardrails slop-scan.config.json`; read the `slop-scan.config.json` `edits` block of `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | the `defensive.empty-catch` group for the two opencode plugins and the `structure.duplicate-function-signatures` group covering the gateguard / readguard / guardrails template + mirror families | EXTEND | add each new `bkit-rules` file to the matching override group and the paired `dogfood-templates.test.ts` `with` string, so `pnpm slop:delta` and the dogfood test stay green |

## Architecture & Component Changes

**Ledger rows:** `700-session-start-rules-read-advisory`, `700-first-action-deny-gate`, `700-rules-content-hash-acknowledgement`, `700-provider-auto-load-rules`

### Database Migrations

None.

### Shared Hook Parts

#### [new] `.bkit/core/hooks/preflight-rules.sh`

- **Reuse Check:** `Reuse Inventory` row "Canonical rules-read advisory text (shell)" — reason (a).
- Defines the advisory string once for the two `SessionStart` hosts and calls the host's `emit_context` with it. Pure text, no host-specific syntax; spliced by a `# {{BKIT_PART preflight-rules.sh}}` line.

#### [new] `.bkit/core/hooks/session-rules-advisory.js`

- **Reuse Check:** `Reuse Inventory` row "Canonical rules-read advisory text + once-per-session helper (JS)" — reason (b).
- Plain declarations only, exactly like every existing part (`gateguard-engine.js`, `readguard-engine.js`, `antigravity-hook.js`): `const RULES_READ_ADVISORY = "…"` and `function rulesReadAdviceOnce(sessionId) {…}`, with no `export` and no `import`. `renderParts` copies a part's bytes into each JS host template, so an `export` would make the rendered `.codex/hooks/bkit-rules.cjs` and `.agents/plugins/bkit/hooks/bkit-rules.cjs` invalid CJS and red `parts.test.ts` `every generated hook parses`. The host template supplies the module scope (`fs` / `os` / `path`) the part assumes; the part line is `// {{BKIT_PART session-rules-advisory.js}}`.
- `rulesReadAdviceOnce(sessionId)` returns the advisory the first time a session id is seen, `null` after; state under the OS temp dir, 24 h TTL, fail-open, never writes into the repo.
- The string is the same sentence as the shell part. No cross-language single source exists — render-time inlining, never shipped — and the `## Hook Text` store cannot hold a `[bkit]`-prefixed message (see `Alternative Approaches & Recommendations`), so the pair is held together by the `Derived Test Matrix` byte-identity row.

### Session-Start Hosts (Claude Code, Cursor)

#### [MODIFY] `.bkit/core/.claude/hooks/bkit-preflight.sh`

- **Existence Check:** file exists.
- Splice `# {{BKIT_PART preflight-rules.sh}}` after `emit_context` is defined and **before** the `LINEAR_ISSUE_ID` bail, so the advisory fires on an IDE session too. Change `emit_context` to accumulate into a variable and register an `EXIT` trap that writes the single JSON document once (advisory alone, or advisory followed by the Linear guard result), from a `printf` path that needs no `python3` — the advisory string is quote- and backslash-free, so the document stays JSON-valid without an encoder and a `python3`-less IDE session still gets the advisory (Claude cannot block, so a lost advisory would be silent). `preflight-linear.sh` is unchanged — its `emit_context` calls just accumulate.

#### [MODIFY] `.bkit/core/.cursor/hooks/bkit-preflight.sh`

- **Existence Check:** file exists.
- Same shape as Claude: move the `emit_context` definition and the advisory spline **above** the `is_background_agent` bail, keep the bail a `grep`-only exit, and make the `EXIT` trap's JSON writer not depend on `python3` on the advisory-only path (the advisory string is quote/backslash-free, so a `printf` form is JSON-safe). `failClosed` blocks only on a non-zero exit, which never happens.

### opencode Host

#### [new] `.bkit/core/.opencode/plugin/bkit-rules.js`

- **Reuse Check:** `Reuse Inventory` row "First-tool advisory, opencode" — reason (b).
- An ES-module plugin exporting `id` + `setup(ctx)` (2.0) and `server()` (1.x), matching `bkit-gateguard.js`'s dual shape. On the first tool call of a session it appends `RULES_READ_ADVISORY` to the tool result (`execute.after` / `tool.execute.after`); later calls append nothing. Fail-open top-level catch; no throw, no stderr.

### Codex Host

#### [new] `.bkit/core/.codex/hooks/bkit-rules.cjs`

- **Reuse Check:** `Reuse Inventory` row "First-pre-action advisory, Codex" — reason (b).
- A `PreToolUse` hook in Claude's stdin/stdout family: reads the payload, and when `rulesReadAdviceOnce(session_id)` returns text, writes `{ hookSpecificOutput: { hookEventName: "PreToolUse", additionalContext } }`. Registered on two single-value `PreToolUse` groups, `apply_patch` and `Bash` — the shape every shipped Codex matcher uses in `.bkit/shared/.codex/hooks.json`; alternation is not verified on that host. Fail-open catch, always exit 0.

### Antigravity Host

#### [new] `.bkit/core/.agents/plugins/bkit/hooks/bkit-rules.cjs`

- **Reuse Check:** `Reuse Inventory` row "First-pre-action advisory, Antigravity" — reason (b).
- Uses the shared `antigravity-hook.js` envelope adapter and `adviseOnce` deny-once delivery: the first tool call is denied once with `RULES_READ_ADVISORY` as the `reason`, the repeated call is allowed. This is Antigravity's only channel to the model; the session is not blocked. Fail-open catch, always exit 0.

### Install Wiring

#### [MODIFY] `.bkit/shared/.opencode/opencode.json`

- **Existence Check:** file exists.
- Add `"./plugin/bkit-rules.js"` to the `plugin` array beside `./plugin/bkit-gateguard.js` and `./plugin/bkit-readguard.js` (config-file-relative spec; a bare `.opencode/…` spec fails to load on 2.0).

#### [MODIFY] `.bkit/shared/.codex/hooks.json`

- **Existence Check:** file exists.
- Add two `PreToolUse` groups for `.codex/hooks/bkit-rules.cjs`, one per single-value matcher `apply_patch` and `Bash`, in the existing guarded-command shape (`test -f … || true`) and matching the two single-value `Bash` groups already shipped.

#### [MODIFY] `.bkit/shared/.agents/plugins/bkit/hooks.json`

- **Existence Check:** file exists.
- Add a `PreToolUse` group for `hooks/bkit-rules.cjs` on the broadest matcher (`write_to_file|replace_file_content|view_file|run_command`), in the existing `f=… || true` shape.

#### [MODIFY] `.bkit/core/engine/install/modules/opencode.ts`, `codex.ts`, `antigravity.ts`

- **Existence Check:** files exist.
- Extend each host's hook-write loop to write the new hook file (Tier-1 for opencode, `writeTier2` markered-text for Codex / Antigravity) beside the two existing hooks.

#### [MODIFY] `.bkit/core/engine/install/manifest.ts`

- **Existence Check:** file exists.
- Add the three new hook paths to the opencode / codex / antigravity manifest blocks, so `bkit check` drift covers them.

### Cron Jobs & Scheduled Tasks

None — the advisory fires on a session-start or first-tool event, not on a schedule.

## Supersession Inventory

None — this change adds advisory hooks and extends existing ones; nothing is replaced or removed.

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/providers.md` (source) | § Hooks parts table: one row each for `preflight-rules.sh` and `session-rules-advisory.js`; § Hooks / § GateGuard: the rules-read advisory, its per-host delivery point, the note that opencode / Codex / Antigravity have no session-start event so the advisory lands at the first tool call, the Codex registration as two single-value groups (`apply_patch`, `Bash`), and the per-session dedup scope (a Claude-family subagent shares the parent `session_id`; a Codex payload carries no subagent id, so a subagent can miss an advisory the parent consumed — same limit GateGuard records). Shipped doc: `shipped-docs-refs.test.ts` scans it at the package source and rejects tracker numbers, ledger keys and finding ids, so record the behaviour, never `#700` or a ledger key |
| `.bkit/providers.md` (mirror) | regenerated by `bkit install` from the source above; `bkit check` must stay drift-clean |
| `docs/architecture.md` | § Consumer Integration Model — the hook-list paragraph (~line 172): add the three new hook files and the two shared parts beside the existing GateGuard / ReadGuard / guardrails list, and note the two `bkit-preflight.sh` hooks now carry the advisory |
| `docs/testing.md` | § Key test files: add `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts`, and record that `preflight-sh.integration.test.ts`'s IDE-skip assertions now expect the advisory on stdout instead of empty stdout |
| `docs/decisions.jsonl` | row `700-session-start-rules-read-advisory` (ACTIVE) — this merge re-appended the same `key` with the final hook shape: two single-value Codex matcher groups, no `export` on the JS part, the advisory sentence duplicated per language and guarded by a test |
| `docs/deferrals.jsonl` | rows `700-first-action-deny-gate`, `700-rules-content-hash-acknowledgement`, `700-provider-auto-load-rules` — written by this plan |
| `docs/knowledge.jsonl` | row `kn-hooks-sessionstart-stdout-is-one-json-document` — gotcha: Claude / Cursor `SessionStart` stdout must be ONE JSON document (accumulate, write once from an `EXIT` trap); the skip path must build that JSON without `python3`, because Cursor's `failClosed` blocks on a non-zero exit and Claude loses the advisory silently |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A | no database |
| **Code** | `git revert {COMMIT}` | the two preflight hooks and (!) the new hook files are markered-text; a revert plus a reinstall restores the previous managed blocks. Consumer-owned driver regions of the existing hooks are untouched. |
| **Risk window** | none | no migration, no deploy; hooks are regenerated at install |

Code-only — `git revert` sufficient.

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### GROUP 1: Advisory delivery across the five hosts

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Deliver the rules-read advisory at session start on Claude Code and Cursor
  - **CREATE:** `.bkit/core/hooks/preflight-rules.sh`: the canonical advisory string and the `emit_context` call for the two `SessionStart` hosts
  - **UPDATE:** `.bkit/core/.claude/hooks/bkit-preflight.sh`: splice `# {{BKIT_PART preflight-rules.sh}}` after `emit_context` is defined and before the `LINEAR_ISSUE_ID` bail, so an IDE session gets it too; make `emit_context` accumulate and write the one JSON document from an `EXIT` trap, on a `printf` path that needs no `python3`
  - **UPDATE:** `.bkit/core/.cursor/hooks/bkit-preflight.sh`: move the `emit_context` definition and the advisory spline above the `is_background_agent` `grep` bail, and give the advisory-only path the same `python3`-free writer
  - **UPDATE:** `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts`: invert the three IDE-skip assertions that today assert empty stdout — `exits 0 silently when LINEAR_ISSUE_ID is empty (existing IDE-skip preserved)`, `a Jira session (token set, no LINEAR_ISSUE_ID) exits 0 silently`, `exits 0 silently when the session is not a background agent` — to expect the advisory on stdout and exit 0, leaving the guard assertions (`JSON.parse(stdout)` + `HARD STOP`) passing
  - **READ:** `.bkit/core/hooks/preflight-linear.sh`: the shared guard, unchanged — its `emit_context` calls now accumulate
  - **READ:** `.bkit/core/engine/render/parts.ts`: how `{{BKIT_PART}}` splices shared parts
  - **DONE WHEN:** both rendered hooks carry the advisory on an IDE session and on a cloud session; neither rendered hook names `AGENTS.md`; the three inverted IDE-skip assertions and the existing preflight guard assertions pass; a fresh-session dogfood on Claude and on Cursor shows the advisory; `pnpm build && git add dist/` ran in this task's commit, so `dist/` matches the edited `.bkit/core/engine/**` sources (`.agents/rules.md` § Repo Authoring, "Engine builds")
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `emits the rules advisory on a Claude IDE session` fails while the hook prints empty stdout on an empty `LINEAR_ISSUE_ID`
    - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `names .agents/rules.md and never AGENTS.md` fails while the emitted context names `AGENTS.md` or names no file
    - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `a cloud session prints one JSON document carrying the advisory and the Linear guard result` fails while the hook prints two JSON documents or drops either string
    - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `a Cursor session emits the advisory without python3 and exits 0` fails while the Cursor skip path needs `python3` or exits non-zero

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Deliver the advisory at the first tool call on opencode
  - **CREATE:** `.bkit/core/hooks/session-rules-advisory.js`: plain `const RULES_READ_ADVISORY = …` and `function rulesReadAdviceOnce(sessionId) {…}` declarations (no `export`, no `import`), spliced as a part
  - **CREATE:** `.bkit/core/.opencode/plugin/bkit-rules.js`: the opencode plugin, dual `setup()` / `server()` shape, appends the advisory to the first tool result once per session, carrying its `// bkit:start` / `{{BKIT_MANAGED_MARKER}}` / `// bkit:end` block with `// {{BKIT_PART session-rules-advisory.js}}` inside it
  - **UPDATE:** `.bkit/core/engine/install/modules/opencode.ts`: write the new plugin beside the two existing ones
  - **UPDATE:** `.bkit/core/engine/install/manifest.ts`: add `.opencode/plugin/bkit-rules.js` to the opencode block
  - **UPDATE:** `.bkit/shared/.opencode/opencode.json`: add `./plugin/bkit-rules.js` to the `plugin` array
  - **UPDATE:** `.bkit/core/engine/render/parts.test.ts`: add `.opencode/plugin/bkit-rules.js` to the splicer list in `the hook templates that splice parts are the sixteen host hooks` (16 → 17)
  - **UPDATE:** `.bkit/core/engine/commands/install/check.integration.test.ts`: add `.opencode/plugin/bkit-rules.js` to the opencode list in `requires the hook files of each installed host, and only those` (2 → 3)
  - **UPDATE:** `slop-scan.config.json`: add `.bkit/core/.opencode/plugin/bkit-rules.js` and `.opencode/plugin/bkit-rules.js` to the opencode `defensive.empty-catch` group, and to the `structure.duplicate-function-signatures` group
  - **UPDATE:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: extend the matching `slop-scan.config.json` `with` strings for those two override groups
  - **READ:** `.bkit/core/.opencode/plugin/bkit-gateguard.js`: the dual-shape driver the new plugin mirrors
  - **READ:** `.bkit/core/hooks/readguard-engine.js`: the OS-temp dedup / TTL pattern the helper follows
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the opencode plugin appends the advisory to the first tool result only, and fails open on a malformed input; `parts.test.ts`, `check.integration.test.ts` and `dogfood-templates.test.ts` pass and `pnpm slop:delta` is clean; a fresh-session dogfood shows the advisory once; `pnpm build && git add dist/` ran in this task's commit, so `dist/` matches the edited `.bkit/core/engine/**` sources (`.agents/rules.md` § Repo Authoring, "Engine builds")
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` `opencode plugin appends the rules advisory to the first tool result` fails while the first tool result carries no advisory
    - `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` `opencode plugin appends nothing on the second call in the same session` fails while the advisory repeats
    - `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` `opencode plugin fails open on a malformed hook input` fails while the plugin throws
    - `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` `the shared advisory names .agents/rules.md and not AGENTS.md` fails while `RULES_READ_ADVISORY` names `AGENTS.md` or no file
    - `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` `the shell part and the JS part hold the byte-identical advisory string` fails while the two parts' advisory sentences differ

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Deliver the advisory at the first tool call on Codex and Antigravity
  - **CREATE:** `.bkit/core/.codex/hooks/bkit-rules.cjs`: `PreToolUse` hook writing the advisory once as `additionalContext`, carrying its `// bkit:start` / `{{BKIT_MANAGED_MARKER}}` / `// bkit:end` block with `// {{BKIT_PART session-rules-advisory.js}}` inside it
  - **CREATE:** `.bkit/core/.agents/plugins/bkit/hooks/bkit-rules.cjs`: `PreToolUse` hook denying the first tool call once with the advisory as its reason, carrying the same managed block and part line
  - **UPDATE:** `.bkit/core/engine/install/modules/codex.ts`: write the new Codex hook file beside the two existing ones
  - **UPDATE:** `.bkit/core/engine/install/modules/antigravity.ts`: write the new Antigravity hook file beside the two existing ones
  - **UPDATE:** `.bkit/core/engine/install/manifest.ts`: add both new hook paths to the codex and antigravity blocks
  - **UPDATE:** `.bkit/shared/.codex/hooks.json`: register `bkit-rules.cjs` as two single-value `PreToolUse` groups, `apply_patch` and `Bash`
  - **UPDATE:** `.bkit/shared/.agents/plugins/bkit/hooks.json`: register `bkit-rules.cjs` on the broadest `PreToolUse` matcher
  - **UPDATE:** `.bkit/core/engine/render/parts.test.ts`: add `.codex/hooks/bkit-rules.cjs` and `.agents/plugins/bkit/hooks/bkit-rules.cjs` to the splicer list (17 → 19)
  - **UPDATE:** `.bkit/core/engine/commands/install/check.integration.test.ts`: add `.codex/hooks/bkit-rules.cjs` to the codex list in `requires the hook files of each installed host, and only those` (3 → 4)
  - **UPDATE:** `slop-scan.config.json`: add the two new Codex / Antigravity hook sources and their mirrors to the `structure.duplicate-function-signatures` group, and their `defensive.empty-catch` entries
  - **UPDATE:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: extend the matching `slop-scan.config.json` `with` strings for those override groups
  - **READ:** `.bkit/core/hooks/antigravity-hook.js`: the envelope adapter and `adviseOnce` deny-once delivery
  - **READ:** `.bkit/core/.codex/hooks/bkit-gateguard.cjs`: the stdin/stdout + fail-open shape the Codex hook mirrors
  - **DEPENDS ON:** 2
  - **DONE WHEN:** the Codex rendered hook writes the advisory once as `additionalContext`; the Antigravity rendered hook denies the first tool call once with the advisory as its reason and allows the retry; both fail open on an empty payload and on a payload carrying no session id; `parts.test.ts`, `check.integration.test.ts` and `dogfood-templates.test.ts` pass and `pnpm slop:delta` is clean; a fresh-session dogfood on Codex and on Antigravity shows the advisory; `pnpm build && git add dist/` ran in this task's commit, so `dist/` matches the edited `.bkit/core/engine/**` sources (`.agents/rules.md` § Repo Authoring, "Engine builds")
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` `codex hook writes the rules advisory as additionalContext once per session` fails while the rendered Codex hook writes no `additionalContext`
    - `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` `codex hook fails open on an empty payload` fails while the rendered Codex hook exits non-zero or throws
    - `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` `an unknown session id still yields the advisory once and never throws` fails while the rendered hook treats a payload with no session id as a hard error or repeats the advisory
    - `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` `antigravity hook denies the first call once with the advisory and allows the retry` fails while the first rendered Antigravity call is allowed
    - `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` `every rendered advisory hook names .agents/rules.md and not AGENTS.md` fails while any rendered hook names `AGENTS.md` or names no file

<!-- bkit:task 3 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### GROUP 2: References and close-out

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Document the advisory and its per-host delivery in the references
  - **UPDATE:** `.bkit/core/.bkit/providers.md`: § Hooks parts table — one row each for `preflight-rules.sh` and `session-rules-advisory.js`; § Hooks / § GateGuard — the advisory, its per-host delivery, the no-session-start note for opencode / Codex / Antigravity, the Codex two-group matcher and the per-session dedup scope. Shipped doc: `shipped-docs-refs.test.ts` rejects tracker numbers, ledger keys and finding ids at the package source, so record behaviour only
  - **UPDATE:** `docs/architecture.md`: § Consumer Integration Model — the hook-list paragraph: the three new hook files, the two shared parts, and the advisory now on both `bkit-preflight.sh` hooks
  - **UPDATE:** `docs/testing.md`: § Key test files — the new `session-rules-advisory.integration.test.ts` and the changed IDE-skip scope of `preflight-sh.integration.test.ts`
  - **UPDATE:** `docs/knowledge.jsonl`: row `kn-hooks-sessionstart-stdout-is-one-json-document`
  - **UPDATE:** `docs/decisions.jsonl`: row `700-session-start-rules-read-advisory` (ACTIVE) — the shipped hook shape: two single-value Codex matcher groups, no `export` on the JS part, the advisory sentence duplicated per language and held together by a test
  - **UPDATE:** `docs/deferrals.jsonl`: rows `700-first-action-deny-gate`, `700-rules-content-hash-acknowledgement`, `700-provider-auto-load-rules` (OPEN) — the three rejected ideas
  - **READ:** `.bkit/core/engine/install/manifest.ts`: the `.bkit/providers.md` byte-equal-text entry
  - **DEPENDS ON:** 1, 2, 3
  - **DONE WHEN:** `.bkit/core/.bkit/providers.md` describes the advisory, its per-host delivery, the Codex matcher shape and the dedup scope; `docs/architecture.md` lists the three hook files and two parts; `docs/testing.md` names the new test file; the knowledge row, the decision row and the three deferral rows exist
  - **TEST FIRST:** n/a — docs

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Refresh this repo's installed mirrors and close out
  - **UPDATE:** `.claude/hooks/bkit-preflight.sh`: regenerated by `bkit install` — the advisory merge into the managed block, never hand-edited
  - **UPDATE:** `.cursor/hooks/bkit-preflight.sh`: regenerated by `bkit install` — the advisory merge into the managed block
  - **UPDATE:** `.opencode/opencode.json`: regenerated by `bkit install` — the `plugin` array gains `./plugin/bkit-rules.js`
  - **UPDATE:** `.codex/hooks.json`: regenerated by `bkit install` — two `PreToolUse` groups for `hooks/bkit-rules.cjs`
  - **UPDATE:** `.agents/plugins/bkit/hooks.json`: regenerated by `bkit install` — one `PreToolUse` group for `hooks/bkit-rules.cjs`
  - **UPDATE:** `.bkit/providers.md`: regenerated by `bkit install` from `.bkit/core/.bkit/providers.md`
  - **READ:** `.bkit/core/engine/install/manifest.ts`: the installed-mirror entries `bkit install` writes
  - **DEPENDS ON:** 4
  - **DONE WHEN:** `bkit install` writes `.opencode/plugin/bkit-rules.js`, `.codex/hooks/bkit-rules.cjs` and `.agents/plugins/bkit/hooks/bkit-rules.cjs`, leaves `bkit check` drift-clean, and every rendered and mirrored hook carries the advisory while none names `AGENTS.md`
  - **TEST FIRST:** n/a — install regeneration of generated artifacts; no behaviour of its own

<!-- bkit:task 5 end -->

<!-- bkit:group 2 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on / no gate-weakening:** every `[NEW]` traces to a `Reuse Inventory` `NEW` row; every `EXTEND` landed in its named artifact; no gate weakened.
- [ ] **Every task has a test or a TEST EXCEPTION:** every planned test recorded a red before its code and is unchanged since; test-order gaps cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 - Verified:** every box above checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test sits in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests fixed; full suite green.
- [ ] **Sweep new tests:** every task's `DONE WHEN` tests exist and pass.
- [ ] **Verify observability:** errors logged and traced per `docs/observability.md`.
- [ ] **Update documentation:** affected docs rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row done; `.agents/docs.md` accurate.
- [ ] **Gate 3 - Verified:** every box above checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit-integration` (which includes `slop:delta`) and `bkit check` pass.
- [ ] **Test Synchronization:** `preflight-sh.integration.test.ts` IDE-skip assertions inverted for the advisory; `parts.test.ts` splicer list taken to 19 templates; `check.integration.test.ts` per-host hook lists updated (opencode 3, codex 4); `dogfood-templates.test.ts` `with` strings updated with `slop-scan.config.json`; `gateguard-parity.integration.test.ts` and `readguard-parity.integration.test.ts` stay green (the existing hooks' contracts are unchanged).
- [ ] **Build Configuration:** no new test-only config; hook tests stay under `.bkit/core/engine/audits/hooks/`, excluded from the production build as today.
- [ ] **Integration (`.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts`, `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts`):** advisory naming, once-per-session dedup, single-JSON-document merge, byte-identical shell / JS advisory parts, fail-open on empty / malformed / session-id-less payloads.
- [ ] **Apply local migrations:** N/A — no database.
- [ ] **Run all tests:** `pnpm vitest run` (full, never scoped) passes.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 - Verified:** every Automated Tests box checked, with proof (test output, CLI result, API response).

### 👤 Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks — advisory only.** An unticked box blocks nothing: not the merge, not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** `pnpm build` then install into a fresh scratch consumer for each host (`node dist/cli.js install --claude --cursor --codex --antigravity --opencode=openrouter --tracker=github`); confirm each rendered hook carries the advisory and no rendered hook names `AGENTS.md`.
- [ ] **Step 2:** start a fresh session per host and confirm the advisory reaches the model once — Claude / Cursor at session start, opencode / Codex / Antigravity at the first tool call — and that no session is blocked.

<!-- bkit:end -->
