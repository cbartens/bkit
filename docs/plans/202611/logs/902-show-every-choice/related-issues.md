## #836 — Record which host and model ran each workflow, on every host (open)

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

### Build the shared pieces once with #860, not twice

The #836 plan and the #860 plan (`docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`) each plan their own version of three engine capabilities. Neither plan mentions this. Whichever issue is built first creates each piece. The second one extends it and does not add a second copy. Before starting each task below, check whether #860 has already landed its side.

<!-- prettier-ignore -->
| Capability | #836 plan | #860 plan | What to do |
| --- | --- | --- | --- |
| **A record of who is calling.** When a step hands work to an agent, the engine records that call so later commands know which run, step and agent they belong to. | Task 3 `host-evidence.ts` (which host is calling, private invocation receipts), Task 7 (records each subagent's configured model just before it starts, in `workflows.ts`), Task 8 (passes the current invocation through every host's rendered files and hooks) | Task 1: `status row --type=invocation`, a common `--invocation` flag resolved in `commands/lib.ts`, invocation events in `ledgers/status.ts` | One record per agent call. It carries the host plus configured model at start (#836) and the run, step and agent (#860). One flag or receipt carries it through hosts and commands. No second "invocation" type in `status.jsonl`. |
| **Locked, confirmed appends.** Only one writer appends to a file at a time, the engine reads back what it wrote, and an interrupted write is checked before it is retried. | Task 6: every `status.jsonl` writer goes through one boundary in `ledgers/status.ts`, with append, flush and read-back confirmation; `journal.ts` is routed through it too | Task 4: per-ledger lock (exclusive-create helper taken out of `locks.ts`), exact prepared bytes, fsync, receipts, `journal.ts` `appendFrictionRow` put under the same lock | One lock-and-confirm helper in `ledgers/status.ts`, used for both `status.jsonl` and the `docs/*.jsonl` ledgers. Both plans change `ledgers/status.ts` and `journal.ts`. Build these two tasks one after the other, not side by side. |
| **An ID for each operation.** Each write gets an ID so that a retry can be recognised. | Tasks 9–10: the "current operation context" is passed through the commit helpers in `ledgers.ts` (`commitOwnSet`, `ownPathCommit`, `commitBookkeeping`, `retriggerCommit`) for the `bkit-host` trailer | Task 4: an operation ID plus a request hash, so a retry returns the original result | The same operation context in both. The commit helpers read the ID that #860 issues, or #860 issues it into the context that #836 already passes. |

#860 already depends on this issue for the observed model. Its Task 1 reads the #836 observation through `run-facts.ts` and adds no detector of its own. The overlap above is the part that has no owner yet. This comment does not make either issue block the other. The plan-current step of `/bkit-build #836` should treat whatever #860 has landed by then as the existing code to extend.

The matching comment is on #860.

## #846 — Make workflow verdicts reflect only unresolved findings (closed)

### Failing test or CI run

The existing summary unit tests explicitly expect `CONCERNS` after a failed review is addressed by a passing update. New regression tests will invert that expectation and cover unrelated passing steps.

### What happened

Workflow summaries retain historical concerns after the corresponding work has been resolved. In `.bkit/core/engine/commands/workflow/summary.ts`, a step's `CONCERNS` is always retained, and a `FAIL` answered by a later step is converted to `CONCERNS`. A rerun can also count an earlier summary verdict as an outstanding concern.

### What should happen

Final and subsequent verdicts reflect unresolved findings. Resolved findings remain visible in the append-only history and summary history.

- PASS when required checks pass and all in-scope findings are resolved and verified.
- CONCERNS when unresolved non-blocking findings, accepted limitations, or verification gaps remain.
- FAIL when required work or checks remain unsuccessful.
- A later PASS clears only findings within its documented scope, with matching task group, review round, or finding evidence where applicable. An unrelated PASS, a decision record, or a different group's verification never clears them.
- Recomputing a summary does not inherit its earlier derived verdict.

### Steps to reproduce

1. Record `plan-review` with `CONCERNS` or `FAIL`.
2. Address its findings and record `plan-apply-review` with `PASS`.
3. Run `bkit workflows summary --workflow=plan --file=...`.
4. Observe that the summary remains `CONCERNS`.

### Affected area

Summary resolution rules, current risks versus history, and tests/documentation shared by all provider workflows.

### Implementation plan

1. Add failing unit regressions for resolved reviews, same-group remediation, unrelated PASS, partial resolution, and repeated summaries.
2. Replace historical severity aggregation with scoped resolution using the existing workflow contracts and finding/task evidence.
3. Preserve original step outcomes and evidence in summary history; retain accepted limitations and open deferrals.
4. Update the workflow catalog, regenerate installed documentation and distribution, run targeted unit/integration checks and exercise the built CLI in a fresh scratch consumer.
5. Record the implementation commit and verification evidence here.

### Work done

- Confirmed the cause in the summary engine and existing unit expectations.
- Created an isolated worktree on `codex/unresolved-verdicts`.
- Baseline summary unit suite: 27 tests passed.
- Implementation in progress; nothing pushed or merged.

### References

Parent: [#99 — Friction triage](https://github.com/cbartens/bkit/issues/99), explicitly requested by the owner.
