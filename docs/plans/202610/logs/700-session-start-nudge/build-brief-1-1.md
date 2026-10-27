# Brief: group 1 — Advisory delivery across the five hosts

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

- Group 1: Advisory delivery across the five hosts — this group
  - TASK 1: Deliver the rules-read advisory at session start on Claude Code and Cursor — open
  - TASK 2: Deliver the advisory at the first tool call on opencode — open
  - TASK 3: Deliver the advisory at the first tool call on Codex and Antigravity — open
- Group 2: References and close-out — next
  - TASK 4: Document the advisory and its per-host delivery in the references — open
  - TASK 5: Refresh this repo's installed mirrors and close out — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Deliver the rules-read advisory at session start on Claude Code and Cursor
  - **CREATE:** `.bkit/core/hooks/preflight-rules.sh`: the canonical advisory string and the `emit_context` call for the two `SessionStart` hosts
  - **UPDATE:** `.bkit/core/.claude/hooks/bkit-preflight.sh`: splice `# {{BKIT_PART preflight-rules.sh}}` after `emit_context` is defined and before the `LINEAR_ISSUE_ID` bail, so an IDE session gets it too; make `emit_context` accumulate and write the one JSON document from an `EXIT` trap, on a `printf` path that needs no `python3`
  - **UPDATE:** `.bkit/core/.cursor/hooks/bkit-preflight.sh`: move the `emit_context` definition and the advisory spline above the `is_background_agent` `grep` bail, and give the advisory-only path the same `python3`-free writer
  - **UPDATE:** `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts`: invert the three IDE-skip assertions that today assert empty stdout — `exits 0 silently when LINEAR_ISSUE_ID is empty (existing IDE-skip preserved)`, `a Jira session (token set, no LINEAR_ISSUE_ID) exits 0 silently`, `exits 0 silently when the session is not a background agent` — to expect the advisory on stdout and exit 0, leaving the guard assertions (`JSON.parse(stdout)` + `HARD STOP`) passing
  - **READ:** `.bkit/core/hooks/preflight-linear.sh`: the shared guard, unchanged — its `emit_context` calls now accumulate
  - **READ:** `.bkit/core/engine/render/parts.ts`: how `{{BKIT_PART}}` splices shared parts
  - **DONE WHEN:** both rendered hooks carry the advisory on an IDE session and on a cloud session; neither rendered hook names `AGENTS.md`; the three inverted IDE-skip assertions and the existing preflight guard assertions pass; a fresh-session dogfood on Claude and on Cursor shows the advisory
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
  - **DONE WHEN:** the opencode plugin appends the advisory to the first tool result only, and fails open on a malformed input; `parts.test.ts`, `check.integration.test.ts` and `dogfood-templates.test.ts` pass and `pnpm slop:delta` is clean; a fresh-session dogfood shows the advisory once
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
  - **DONE WHEN:** the Codex rendered hook writes the advisory once as `additionalContext`; the Antigravity rendered hook denies the first tool call once with the advisory as its reason and allows the retry; both fail open on an empty payload and on a payload carrying no session id; `parts.test.ts`, `check.integration.test.ts` and `dogfood-templates.test.ts` pass and `pnpm slop:delta` is clean; a fresh-session dogfood on Codex and on Antigravity shows the advisory
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` `codex hook writes the rules advisory as additionalContext once per session` fails while the rendered Codex hook writes no `additionalContext`
    - `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` `codex hook fails open on an empty payload` fails while the rendered Codex hook exits non-zero or throws
    - `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` `an unknown session id still yields the advisory once and never throws` fails while the rendered hook treats a payload with no session id as a hard error or repeats the advisory
    - `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` `antigravity hook denies the first call once with the advisory and allows the retry` fails while the first rendered Antigravity call is allowed
    - `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` `every rendered advisory hook names .agents/rules.md and not AGENTS.md` fails while any rendered hook names `AGENTS.md` or names no file

<!-- bkit:task 3 end -->

Reuse Inventory rows left out: 8; Architecture entries left out: 12 — read them in docs/plans/202610/700-session-start-nudge-plan.md § Reuse Inventory and § Architecture & Component Changes.
