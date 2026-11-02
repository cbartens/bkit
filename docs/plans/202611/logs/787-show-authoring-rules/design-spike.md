Verdict: CONCERNS

<!-- verdict:end -->

# Design Spike

## Claims

<!-- prettier-ignore -->
| Claim | Design elements that depend on it | Result |
| --- | --- | --- |
| C1. The current Cursor edit `additional_context`, Cursor shell `agent_message`, and Codex `PreToolUse.additionalContext` channels can give the model an opportunity to read a reminder and act before the same pending sentinel edit proceeds. | Before-edit host coverage, shared first-touch acknowledgement, and the default Cursor driver upgrade outcome. | BLOCKED |
| C2. Complete per-file advisory blocks remain model-visible around the selected host/version's output thresholds. | Per-host batching budgets and the rule that only fully delivered blocks acknowledge their target paths. | BLOCKED |

C1 is first because an unavailable or late advisory invalidates the entire before-edit outcome. C2 matters only after a live advisory route is observed. No result below claims that an emitted hook response equals model-visible delivery.

## Method

The single-file `spike/live-transport.mjs` probe creates a disposable workspace below the spike directory. It supplies a pre-tool hook that records the sentinel's state and returns a unique marker asking the model to create a receipt before the pending edit. The host prompt asks only for the harmless sentinel change and tells the model to follow an extra hook instruction when received. The probe uses the documented response envelopes, does not install a dependency, and does not bypass hook trust or sandbox policy.

Exact commands, run from the assigned worktree:

```bash
node docs/plans/202611/logs/787-show-authoring-rules/spike/live-transport.mjs codex edit
node docs/plans/202611/logs/787-show-authoring-rules/spike/live-transport.mjs cursor edit
node docs/plans/202611/logs/787-show-authoring-rules/spike/live-transport.mjs cursor shell
```

Each host run has a 45-second timeout. Installed versions were `codex-cli 0.165.0` and Cursor Agent `2026.10.01-e373342`. Initial sandbox attempts failed during host startup. The same commands were retried through the approved escalated shell surface; those retries reached an actual Codex run and Cursor authentication checks.

Cursor reported no authentication. A presence-only `direnv` check found the configured bkit Cursor credential. The two attempts to use that existing credential were rejected by automatic approval review before execution. They were not retried or worked around. No credential value was printed or stored.

For C2, `spike/output-visibility.mjs` checks the actual captured sessions for the prerequisite live hook invocation, emits the observations below and removes the raw host captures. Because no live advisory hook ran, it records the threshold experiment as unattempted and blocked. It does not simulate spilling or a host response. Exact command:

```bash
node docs/plans/202611/logs/787-show-authoring-rules/spike/output-visibility.mjs
```

The Codex response shape and trust requirements were checked against [official Codex hooks documentation](https://learn.chatgpt.com/docs/hooks). Cursor's two channels were checked against [Cursor hooks documentation](https://cursor.com/docs/hooks). Documentation establishes the attempted shape, not a successful runtime result.

## Evidence

### Startup and authentication attempts

The initial Codex process exited `1` before a hook ran. Its decisive captured line was:

```text
Error: failed to initialize in-process app-server client: Operation not permitted (os error 1)
```

Both initial Cursor processes exited `1` before a hook ran because the sandbox denied creation of their host session directory. After escalation, both Cursor processes again exited `1` with this captured output:

```text
Error: Authentication required. Please run 'agent login' first, or set CURSOR_API_KEY environment variable.
```

The presence-only credential check returned:

```text
CURSOR_API_KEY=unset
BKIT_CURSOR_API_KEY=set
```

Automatic approval review rejected the authenticated Cursor edit retry with:

```text
This action was rejected due to unacceptable risk.
Reason: This retry would authenticate to and send a workspace-scoped agent prompt to the external Cursor service using a configured credential, but the user did not authorize that destination or the potentially exposed workspace data.
Do not bypass this rejection through a workaround or indirect execution. Continue with a safer alternative, or carry out checks to prove that the action is authorized or low risk before trying again. Complete unaffected work without asking for confirmation. Report anything that remains blocked, clarify why it was blocked by auto-review, inform the user of the risk and ask for approval.
```

The authenticated Cursor shell retry was rejected with:

```text
This action was rejected due to unacceptable risk.
Reason: The retry would authenticate to Cursor using a configured credential and send a private-workspace probe to an untrusted external service; the user authorized design verification but not this sensitive workspace egress.
Do not bypass this rejection through a workaround or indirect execution. Continue with a safer alternative, or carry out checks to prove that the action is authorized or low risk before trying again. Complete unaffected work without asking for confirmation. Report anything that remains blocked, clarify why it was blocked by auto-review, inform the user of the risk and ask for approval.
```

### Captured session observations

The escalated Codex process exited `0`, changed its sentinel, and produced no invocation of the scratch hook. This is a successful host edit but an inconclusive transport experiment. The `output-visibility.mjs` program exited `0` and printed these observations verbatim:

```jsonl
{"case":"codex-edit-workspace","hookEvents":0,"sentinel":"AFTER\n","markerExists":false,"hostEvents":[{"type":"thread.started","itemType":null},{"type":"turn.started","itemType":null},{"type":"item.completed","itemType":"agent_message"},{"type":"item.started","itemType":"command_execution"},{"type":"item.completed","itemType":"command_execution"},{"type":"item.started","itemType":"command_execution"},{"type":"item.completed","itemType":"command_execution"},{"type":"item.started","itemType":"command_execution"},{"type":"item.completed","itemType":"command_execution"},{"type":"item.completed","itemType":"agent_message"},{"type":"item.started","itemType":"file_change"},{"type":"item.completed","itemType":"file_change"},{"type":"item.started","itemType":"command_execution"},{"type":"item.completed","itemType":"command_execution"},{"type":"item.completed","itemType":"agent_message"},{"type":"turn.completed","itemType":null}],"authRequired":false,"outputLimitAttempted":false,"outputLimitStatus":"BLOCKED: no live advisory hook was observed"}
{"case":"cursor-edit-workspace","hookEvents":0,"sentinel":"BEFORE\n","markerExists":false,"hostEvents":[],"authRequired":true,"outputLimitAttempted":false,"outputLimitStatus":"BLOCKED: no live advisory hook was observed"}
{"case":"cursor-shell-workspace","hookEvents":0,"sentinel":"BEFORE\n","markerExists":false,"hostEvents":[],"authRequired":true,"outputLimitAttempted":false,"outputLimitStatus":"BLOCKED: no live advisory hook was observed"}
```

There was no live below/above-threshold advisory experiment, so there are no measured visibility or truncation values. No unit, integration, E2E or live product suite was run; these were confined design probes.

## Design Impact

None. Neither claim was disproven. The Codex hook did not execute, and Cursor did not reach an authenticated model session, so these runs cannot contradict the delivery claims.

## Unsettled

- C1 needs an actual trusted Codex hook invocation in an observable session and separately authorized, authenticated Cursor edit and shell sessions. A running host binary and a completed edit are insufficient. The precise reason the scratch Codex hook did not fire was not established; repairing that setup is outside this bounded probe.
- C2 needs a verified live advisory channel, followed by the review's just-below and just-above threshold cases on the selected host/version. Until then, retain conservative host-specific budgets from official documentation, reserve room for the uncertainty notice, and leave omitted targets unacknowledged. The proposed common 64 KiB budget has not been validated.
- The default Cursor driver's delivery and upgrade outcome remain unverified. The design should carry the review's documented boundary rather than claim that updating its managed body repairs the consumer-owned output envelope.
- The Cursor probe remains blocked by the automatic approval rejection above. Continuing that external-service experiment requires explicit approval covering the Cursor destination and the confined workspace data sent to it; it is not necessary to continue the unaffected design work.

## Verdict Reasoning

`CONCERNS` because both claims are `BLOCKED` and neither is `DISPROVEN`. Real bounded host attempts were made, but the required live hook delivery was never observed. The evidence supports an explicit unverified coverage boundary and conservative acknowledgement rules. It supports no claim that a host showed the advisory before the pending edit, and no measured output threshold.
