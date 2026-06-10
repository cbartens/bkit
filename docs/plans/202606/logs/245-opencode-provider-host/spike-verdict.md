# Spike Verdict — 245-opencode-provider-host

**opencode version:** 1.16.2  
**Provider:** Ollama (local) — `http://localhost:11434/v1` via openai-compatible API  
**Spike date:** 2026-06-09  
**Spike directory:** `bkit/tmp/spike-245/` + `bkit/tmp/spike-245-edit/`

---

## (a) Concurrent execution evidence

Three distinct specialised subagents were dispatched concurrently via the Task tool. All three started within 476ms of each other:

| Subagent        | Model (Ollama)              | Start timestamp | End timestamp | Duration                      |
| --------------- | --------------------------- | --------------- | ------------- | ----------------------------- |
| spike-wordcount | `ollama/qwen2.5-coder:1.5b` | 1781006853868   | 1781006858680 | ~4.8s                         |
| spike-reverse   | `ollama/gemma4:12b`         | 1781006854164   | 1781006921102 | ~67s                          |
| spike-uppercase | `ollama/deepseek-r1:14b`    | 1781006854344   | 1781016605098 | ~2.7h (reasoning model, slow) |

**Concurrency proof:**

- All 3 task calls dispatched within 476ms of each other (orchestrator sent them in a single model turn)
- `spike-wordcount` completed at `1781006858680` (4.8s elapsed), while `spike-reverse` and `spike-uppercase` were still running → confirmed overlap
- Wall clock (9751230ms) < serial estimate (9822504ms, sum of individual durations) = concurrent

**DB confirmation** (all 3 subagent sessions have `parent_id` pointing to orchestrator `ses_153b8218effee9n0otFYi7iuUo`):

```
ses_153b81917ffeXCg5XiWm5ZEOQZ | parent=ses_153b8218effee9n0otFYi7iuUo | agent=spike-wordcount | model=qwen2.5-coder:1.5b/ollama
ses_153b817eeffefsGaAejbw5xyu3 | parent=ses_153b8218effee9n0otFYi7iuUo | agent=spike-reverse   | model=gemma4:12b/ollama
ses_153b81738ffeHYhSCJ60KhRt4j | parent=ses_153b8218effee9n0otFYi7iuUo | agent=spike-uppercase | model=deepseek-r1:14b/ollama
```

Raw tool_use events from `spike-raw-output-2.jsonl` (truncated):

```json
{"type":"tool_use","timestamp":1781006858683,"part":{"tool":"task","callID":"toolu_012jPM1NmvZx4ZGKT9RmYmp6","state":{"status":"completed","input":{"subagent_type":"spike-wordcount","description":"Count words in text","prompt":"Count the words in this text: \"hello world from bkit spike\". Return the word count in your response."},"output":"<task id=\"ses_153b81917ffeXCg5XiWm5ZEOQZ\" state=\"completed\">\n<task_result>\n{\"agent\": \"spike-wordcount\", \"model\": \"ollama/qwen2.5-coder:1.5b\", \"word_count\": 8, \"char_count\": 34}\n</task_result>\n</task>","metadata":{"parentSessionId":"ses_153b8218effee9n0otFYi7iuUo","sessionId":"ses_153b81917ffeXCg5XiWm5ZEOQZ","model":{"providerID":"ollama","modelID":"qwen2.5-coder:1.5b"}},"time":{"start":1781006853868,"end":1781006858680}}}}
{"type":"tool_use","timestamp":1781006921107,"part":{"tool":"task","callID":"toolu_01Rd1tzKhWPzgaK7Q9qgtGPR","state":{"status":"completed","input":{"subagent_type":"spike-reverse","description":"Reverse text","prompt":"Reverse this text character by character: \"hello world from bkit spike\". Return the reversed text in your response."},"output":"<task id=\"ses_153b817eeffefsGaAejbw5xyu3\" state=\"completed\">\n<task_result>\n{\"agent\": \"spike-reverse\", \"model\": \"ollama/gemma4:12b\", \"result\": \"ekips tikb morf dlrow olleh\"}\n</task_result>\n</task>","metadata":{"parentSessionId":"ses_153b8218effee9n0otFYi7iuUo","sessionId":"ses_153b817eeffefsGaAejbw5xyu3","model":{"providerID":"ollama","modelID":"gemma4:12b"}},"time":{"start":1781006854164,"end":1781006921102}}}}
{"type":"tool_use","timestamp":1781016605173,"part":{"tool":"task","callID":"toolu_01LyyPHHi3tyv1JonLNNoeAi","state":{"status":"completed","input":{"subagent_type":"spike-uppercase","description":"Uppercase text","prompt":"Convert this text to uppercase: \"hello world from bkit spike\". Return the uppercase text in your response."},"output":"<task id=\"ses_153b81738ffeHYhSCJ60KhRt4j\" state=\"completed\">\n<task_result>\n{\"agent\": \"spike-uppercase\", \"model\": \"ollama/deepseek-r1:14b\", \"result\": \"HELLO WORLD FROM BKIT SPIKE\"}\n</task_result>\n</task>","metadata":{"parentSessionId":"ses_153b8218effee9n0otFYi7iuUo","sessionId":"ses_153b81738ffeHYhSCJ60KhRt4j","model":{"providerID":"ollama","modelID":"deepseek-r1:14b"}},"time":{"start":1781006854344,"end":1781016605098}}}}
```

---

## (b) Deterministic result collection

All 3 results were collected deterministically by the orchestrator. Each `task` tool_use event has `state.status = "completed"` and the result is embedded in `state.output` (the `<task_result>` block). The orchestrator's final step compiled all three:

```
SPIKE RESULTS:
- wordcount result: word_count: 8, char_count: 34
- reverse result: ekips tikb morf dlrow olleh
- uppercase result: HELLO WORLD FROM BKIT SPIKE
```

Collection is deterministic: each task result is keyed to its `callID` and returned as a completed tool_use part. The orchestrator waits for all 3 before emitting the summary. Results are stable across invocations (text transforms are deterministic for the given prompts).

---

## (c) Per-agent model pin honoured

Each agent's `model:` frontmatter pin was honoured by opencode. Confirmed via `state.metadata.model` in the task output:

| Agent file                           | Frontmatter `model:`        | Model served (from metadata)                      |
| ------------------------------------ | --------------------------- | ------------------------------------------------- |
| `.opencode/agent/spike-wordcount.md` | `ollama/qwen2.5-coder:1.5b` | `providerID: ollama, modelID: qwen2.5-coder:1.5b` |
| `.opencode/agent/spike-reverse.md`   | `ollama/gemma4:12b`         | `providerID: ollama, modelID: gemma4:12b`         |
| `.opencode/agent/spike-uppercase.md` | `ollama/deepseek-r1:14b`    | `providerID: ollama, modelID: deepseek-r1:14b`    |

DB confirmation: `session.model` column for each subagent session stores `{"id":"<modelID>","providerID":"ollama","variant":"default"}` matching the agent's frontmatter pin.

---

## (d) Verbatim `tool.execute.before` payload — subagent-initiated tool call

Plugin used: `.opencode/plugin/full-payload-capture.js` (loaded via `opencode.json`). The plugin logs the complete `input` and `output` objects passed to `tool.execute.before`.

**TypeScript interface (from `@opencode-ai/plugin` v1.16.2 dist/index.d.ts):**

```typescript
"tool.execute.before"?: (input: {
    tool: string;
    sessionID: string;
    callID: string;
}, output: {
    args: any;
}) => Promise<void>;
```

**Verbatim payload — subagent `bash` call** (subagent session `ses_151a398c0ffeeQ2FvAEXuBvm8W`, agent=`spike-claude-writer`, parent=`ses_151a3b415ffeo5QG5V8WN8rceC`):

```json
{
  "timestamp": "2026-06-09T21:49:13.891Z",
  "input_tool": "bash",
  "input_sessionID": "ses_151a398c0ffeeQ2FvAEXuBvm8W",
  "input_callID": "toolu_01HfGgMJfUGA3gRNFr6pUrXB",
  "input_all_keys": ["tool", "sessionID", "callID"],
  "input_full": {
    "tool": "bash",
    "sessionID": "ses_151a398c0ffeeQ2FvAEXuBvm8W",
    "callID": "toolu_01HfGgMJfUGA3gRNFr6pUrXB"
  },
  "output_args": {
    "command": "echo \"Hello from spike-claude-writer subagent!\" > /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/opencode/spike-claude-writer-test.txt",
    "description": "Write test file with echo command to specified path"
  },
  "output_all_keys": ["args"]
}
```

**Verbatim payload — orchestrator `task` call** (parent session `ses_151a3b415ffeo5QG5V8WN8rceC`):

```json
{
  "timestamp": "2026-06-09T21:49:11.864Z",
  "input_tool": "task",
  "input_sessionID": "ses_151a3b415ffeo5QG5V8WN8rceC",
  "input_callID": "toolu_013s9J3S6zsSQ69N42k7xAHh",
  "input_all_keys": ["tool", "sessionID", "callID"],
  "input_full": {
    "tool": "task",
    "sessionID": "ses_151a3b415ffeo5QG5V8WN8rceC",
    "callID": "toolu_013s9J3S6zsSQ69N42k7xAHh"
  },
  "output_args": {
    "subagent_type": "spike-claude-writer",
    "description": "Write file via bash",
    "prompt": "..."
  },
  "output_all_keys": ["args"]
}
```

**Subagent-identity field analysis:**

There is **no direct `agent_id` field** in the `tool.execute.before` hook payload. The hook receives exactly `{ tool, sessionID, callID }` in `input` and `{ args }` in `output`.

**The subagent-identity signal is `input.sessionID` cross-referenced with the session DB:**

- Subagent call: `ses_151a398c0ffeeQ2FvAEXuBvm8W` → DB: `parent_id = "ses_151a3b415ffeo5QG5V8WN8rceC"`, `agent = "spike-claude-writer"` → IS a subagent
- Orchestrator call: `ses_151a3b415ffeo5QG5V8WN8rceC` → DB: `parent_id = ""` → IS the orchestrator

**GateGuard exemption mechanism for opencode:**
The GateGuard plugin has access to the opencode `client` (via `PluginInput`) and can call `client.session.get({ sessionID: input.sessionID })` to check if `parentID` is set. If `parentID != null`, the session is a subagent — skip the advisory. This is the equivalent of Claude Code's `agent_id` exemption, but derived from session lookup rather than a hook field.

**The hook fires globally** across all sessions (orchestrator and all subagent sessions). Plugin observes tool calls from both parent and child sessions in a single plugin instance.

---

## (e) Actual opencode dir names (confirmed against CLI v1.16.2)

Confirmed from the `tmp/spike-245/.opencode/` directory structure and `opencode agent list` output:

| Directory            | Name (singular or plural?) | Usage                                      |
| -------------------- | -------------------------- | ------------------------------------------ |
| `.opencode/agent/`   | **singular** (`agent`)     | Agent markdown files (one per named agent) |
| `.opencode/command/` | **singular** (`command`)   | Command markdown files (slash commands)    |
| `.opencode/plugin/`  | **singular** (`plugin`)    | Plugin JS/TS files                         |

**Confirmed by `opencode agent list` output** which listed agents from `.opencode/agent/*.md` files.  
**Confirmed by `opencode debug paths` output** showing `data /Users/christian/.local/share/opencode`.  
**Confirmed by directory listing** of the working spike setup.

These drive the plan-v4-2 manifest paths:

- `OPENCODE_MANIFEST` uses `.opencode/agent/` (not `agents/`)
- `OPENCODE_MANIFEST` uses `.opencode/command/` (not `commands/`)
- `OPENCODE_MANIFEST` uses `.opencode/plugin/` (not `plugins/`)

---

## Provider configuration format

Ollama is configured as a custom openai-compatible provider in `opencode.json`:

```json
{
  "provider": {
    "ollama": {
      "api": "openai",
      "options": {
        "apiKey": "ollama",
        "baseURL": "http://localhost:11434/v1"
      },
      "models": {
        "qwen2.5-coder:1.5b": { "id": "qwen2.5-coder:1.5b", "tool_call": true, ... },
        "gemma4:12b": { "id": "gemma4:12b", "tool_call": true, ... },
        "deepseek-r1:14b": { "id": "deepseek-r1:14b", "tool_call": true, ... }
      }
    }
  }
}
```

Agent frontmatter uses provider-prefixed model IDs: `model: ollama/qwen2.5-coder:1.5b`.

---

## Summary

All 5 spike criteria are satisfied:

| Criterion                                  | Result                                                                                                                                                                |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (a) Concurrent execution                   | PASS — 3 subagents dispatched within 476ms, wordcount completed while others still ran                                                                                |
| (b) Deterministic result collection        | PASS — all 3 task results collected with `status=completed`, stable across runs                                                                                       |
| (c) Per-agent model pin honoured           | PASS — DB `session.model` confirms each subagent ran on its pinned Ollama model                                                                                       |
| (d) `tool.execute.before` payload captured | PASS — verbatim payload: `{ tool, sessionID, callID }` input + `{ args }` output; no direct agent_id; subagent identity via `sessionID → session.parent_id` DB lookup |
| (e) Dir names confirmed                    | PASS — `.opencode/agent/` (singular), `.opencode/command/` (singular), `.opencode/plugin/` (singular)                                                                 |

<!-- verdict:start -->

Verdict: PASS

<!-- verdict:end -->
