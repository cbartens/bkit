## Session Prompt — this run's, newer than everything below

[$bkit-design](/Users/christian/Documents/GitHub/bkit/.agents/skills/bkit-design/SKILL.md) #836

Retry bkit-design. If a sandbox restriction is resolved by an approved retry, continue the workflow instead of treating it as a failure.

## Issue description — oldest

### Problem

After a workflow run, bkit often cannot say which host (Claude Code, Codex, Cursor, OpenCode or Antigravity) ran it, or which model. A real case: a consumer's build run had no record of its host, and its ship run had one. The best answer was "probably Codex": the build commits had no Claude co-author lines, and that was the only clue. Nothing named it.

Three separate gaps cause this:

1. **Only Claude Code gets a host row.** `recordChat` in `.bkit/core/engine/commands/workflow/workflows.ts` appends a `session` row to the run's `status.jsonl`, but only when `hostChat` in `.bkit/core/engine/commands/workflow/run-facts.ts` finds `CLAUDE_CODE_SESSION_ID`. On the other four hosts it writes nothing, so "no row" means both "not Claude Code" and "unknown".
2. **The Claude Code check can name the wrong host.** Hosts pass their environment variables down to whatever they launch. A live probe in this session: `codex exec`, started from a Claude Code shell, saw `CLAUDE_CODE_SESSION_ID` and the other `CLAUDE_CODE_*` variables next to its own `CODEX_THREAD_ID`. So a Codex run started from a Claude Code terminal gets a `claude-code` row naming the Claude chat. `bkit cursor` and `bkit opencode` (`.bkit/core/engine/commands/launch.ts`) pass `process.env` through as well. Started from a Claude Code shell, every Cursor or OpenCode run after that would be recorded as that Claude chat.
3. **Nothing records the model.** The `outcome` row in `.bkit/stats.jsonl` (built in `closeWorkflow`, `workflows.ts`) carries no host and no model. Its `context` block is Claude Code only. Claude Code puts no model name in the shell's environment (checked: `CLAUDE_EFFORT` is set, no model variable is).

Commit co-author lines are no substitute. The host adds them (Claude Code does, Codex does not), and bkit writes no commit trailer of its own (no `Co-Authored-By` or trailer text in `.bkit/core/workflows/`, `.bkit/core/prompts/` or the engine).

The harvest (`scripts/harvest/bkit-harvest.mjs`) already reads every host's local chat files and records the model per chat in `usage.byModel`. But it runs only in bkit's own checkout and is never shipped (line 2). It also links a chat to a run only through `session` rows, or by time and issue overlap when there are none. So consumer repos get nothing, and in bkit's own checkout the link for non-Claude hosts is a guess.

### Outcome

Every workflow run, on all five hosts, records which host ran it and which model or models did the work, in the run's own log. A reader can answer "was it Codex, and on which model?" from the repo alone, with no guessing from commit lines.

### Success criteria

- A run on each of the five hosts writes a `session` row whose `platform` names that host, with a chat fingerprint whenever the host exposes a chat id.
- A run whose host cannot be told apart writes an explicit `platform: "unknown"` row, not nothing.
- A Codex, Cursor or OpenCode run started from a Claude Code shell, including through `bkit cursor` / `bkit opencode`, is recorded as that host, not as `claude-code`.
- The `outcome` row names the host and the models used (orchestrator and subagents), or says the host keeps no model record.
- `bkit stats` shows host and model per run.

### Constraints and non-goals

- Stack-agnostic and POSIX-portable, like the rest of the engine (`.agents/rules.md` § Provider parity).
- Read-only on the hosts' local files. Fail-open: a host file that cannot be read leaves the field empty and never fails the close.
- No raw chat ids in the ledgers. Keep the existing fingerprint (`chatFingerprint`, `run-facts.ts`).
- Not in scope: run cost. That is #526 — Telemetry: record per-workflow OpenCode cost in stats.jsonl (https://github.com/cbartens/bkit/issues/526). This issue should give #526 the OpenCode session id it needs.

### What each host exposes (checked 2026-11-03)

<!-- prettier-ignore -->
| Host | Chat id in the shell's environment | Where the model is recorded | How sure |
| --- | --- | --- | --- |
| Claude Code | `CLAUDE_CODE_SESSION_ID` (used today) | transcript `message.model`, already read at close by `agentContextBlock` | confirmed live |
| Codex 0.165.0 | `CODEX_THREAD_ID`; also `CODEX_SESSION_ID`, `CODEX_VERSION` | rollout `turn_context.model`; the rollout file name ends in a uuid | variables confirmed live with `codex exec`; that the uuid equals `CODEX_THREAD_ID` is not yet checked |
| OpenCode | `OPENCODE_SESSION_ID`, `OPENCODE=1` | `opencode api get /api/session/<id>` or `opencode.db` | confirmed live in #526 |
| Cursor agent 2026.10.01 | `CURSOR_CONVERSATION_ID`, `CURSOR_AGENT_CHAT_ID`, `CURSOR_AGENT` | chat `store.db`, `providerOptions.cursor.modelName` (harvest reads it) | names found in the installed bundle only; a live probe was not run |
| Antigravity (`agy`) | `ANTIGRAVITY_CONVERSATION_ID` | conversation `.db` `gen_metadata` (harvest reads field `1.19`) | name found in the binary only; a live probe was not run |

Each host's session-start hook already runs from bkit (Claude Code and Cursor `preflight`, `antigravity-hook.js`), and a hook knows its own host for certain. Antigravity's hook stdin carries `conversationId` (`.bkit/core/hooks/antigravity-hook.js:5`).

### Decisions already made

- The `session` row stays the place the host is recorded: the close and the harvest already read it.
- The harvest's per-host readers are the reference for where each host keeps the model, but the shipped engine cannot import them (they are not shipped).

### Open questions

1. **Telling the host apart when variables leak.** Choices: (a) walk the parent processes and take the nearest host process; (b) let each host's session-start hook stamp its host and chat id into a marker that `bkit workflows start` reads; (c) a fixed precedence among the variables. (c) fails when one host launches another in either order.
2. **Should `bkit cursor` / `bkit opencode` drop inherited `CLAUDE_CODE_*` variables** before launching? It is cheap, but it fixes only the launch path.
3. **When to read the model:** at `workflows start` (the hook payload, if a host puts the model in it), at close (from the host's local files, as Claude Code does now), or both. The close reading covers model switches mid-run.
4. **Subagents:** record the model each subagent actually used, or fall back to the model bkit pinned for that agent (`.bkit/core/engine/render/models.ts`) when the host's files do not say?
5. **Commit trailer:** should workflow commits also carry a bkit trailer (for example `Bkit-Host: codex`), so the host is visible in `git log` without the run log?

### References

- `.bkit/core/engine/commands/workflow/run-facts.ts` § `hostChat`, `chatFingerprint`, `agentContextBlock`
- `.bkit/core/engine/commands/workflow/workflows.ts` § `recordChat`, `closeWorkflow` (`outcomeRow`)
- `.bkit/core/engine/commands/launch.ts` § `bkit cursor` / `bkit opencode` environment merge
- `scripts/harvest/bkit-harvest.mjs` header § Hosts read
- #526 — Telemetry: record per-workflow OpenCode cost in stats.jsonl (https://github.com/cbartens/bkit/issues/526)
- #721 — Model registry (https://github.com/cbartens/bkit/issues/721)
- #752 — Provider support (https://github.com/cbartens/bkit/issues/752)

## Grill decisions — the owner's answers in this run, the newest text

Settled = the human's answer; the design follows it and flags any departure for the human to confirm. Assumed = unconfirmed default; override only with a stated reason. Open = unknown; the design states how it resolves each.

### Settled

- Q1 Unverified subagent models: A. Show actual models when known; otherwise show the configured model separately as unverified.
- Q2 Model changes: A. Record the initial identity, then collect available model evidence at close across the whole run, including switches and resumed sessions.
- Q3 Commit metadata: B. Include host information in workflow commit messages as well as logs and stats.
- Q4 Commit trailer meaning: A. Each commit names the host creating that commit, or explicitly says unknown. The owner specifies lowercase bkit; the exact trailer is `bkit-host`.
- Q5 Draft acceptance scenario: A, yes. The owner accepted the draft, with the trailer spelling corrected to `bkit-host`.

### Assumed, not confirmed

None.

### Open

None.

### Draft Acceptance Scenario

> **DRAFT only:** reviewed in the design interview. Starting point for the design's Acceptance Scenario, not a fixed contract: the design may change any part, and records each change as a Decisions row.

#### Narrative

After a workflow finishes, I can tell from the repository which hosts and models did the work, including subagents and resumed sessions. I can also see the host responsible for each workflow commit in its `bkit-host` trailer.

#### Success Criteria

- All five supported hosts produce a session record; uncertain identification explicitly records `unknown`.
- Chat identifiers are fingerprinted, never stored raw in ledgers.
- Run outcomes and `bkit stats` report observed models across the run, with configured fallback models clearly marked unverified.
- Workflow commits carry `bkit-host`, naming the committing host or `unknown`.
- Unreadable host records never prevent workflow completion.

#### Key Edge Cases

- One host launches another and passes along its environment variables.
- Models switch, subagents use different models, or a workflow resumes on another host.
- Host records are missing, unreadable, or cannot be confidently linked to the run.

#### Process Sketch

- WHEN Codex runs inside a Claude Code shell → THEN the session identifies Codex when supported by reliable evidence.
- WHEN the host cannot be determined → THEN the session and commit trailer explicitly say `unknown`.
- WHEN models change during a run → THEN the final report includes the observed models.
- WHEN a subagent's actual model is unavailable → THEN its configured model is shown as unverified.
- WHEN another host resumes the workflow → THEN both sessions remain represented, and subsequent commits name their committing host.
- WHEN local host records cannot be read → THEN the workflow completes with the reporting gap visible.

