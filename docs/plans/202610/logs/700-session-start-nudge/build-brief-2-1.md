# Brief: group 2 — References and close-out

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
- Group 2: References and close-out — this group
  - TASK 4: Document the advisory and its per-host delivery in the references — open
  - TASK 5: Refresh this repo's installed mirrors and close out — open

## The work

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

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Deliver the rules-read advisory at session start on Claude Code and Cursor — `.bkit/core/hooks/preflight-rules.sh`, `.bkit/core/.claude/hooks/bkit-preflight.sh`, `.bkit/core/.cursor/hooks/bkit-preflight.sh`, `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts`
- TASK 2 (group 1, done): Deliver the advisory at the first tool call on opencode — `.bkit/core/hooks/session-rules-advisory.js`, `.bkit/core/.opencode/plugin/bkit-rules.js`, `.bkit/core/engine/install/modules/opencode.ts`, `.bkit/core/engine/install/manifest.ts`, `.bkit/shared/.opencode/opencode.json`, `.bkit/core/engine/render/parts.test.ts`, `.bkit/core/engine/commands/install/check.integration.test.ts`, `slop-scan.config.json`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`
- TASK 3 (group 1, done): Deliver the advisory at the first tool call on Codex and Antigravity — `.bkit/core/.codex/hooks/bkit-rules.cjs`, `.bkit/core/.agents/plugins/bkit/hooks/bkit-rules.cjs`, `.bkit/core/engine/install/modules/codex.ts`, `.bkit/core/engine/install/modules/antigravity.ts`, `.bkit/core/engine/install/manifest.ts`, `.bkit/shared/.codex/hooks.json`, `.bkit/shared/.agents/plugins/bkit/hooks.json`, `.bkit/core/engine/render/parts.test.ts`, `.bkit/core/engine/commands/install/check.integration.test.ts`, `slop-scan.config.json`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`
