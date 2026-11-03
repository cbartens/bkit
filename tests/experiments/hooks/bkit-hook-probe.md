# User-run host advisory probe

> [!CAUTION]
> **Purpose:** Collect comparable live evidence for reminder timing and message visibility in five agent hosts, using synthetic files only.
>
> **Rules:**
>
> - Keep probes in a new disposable workspace, separate from the bkit checkout.
> - Follow `.bkit/authoring.md` § All Agent-Read Files when editing this experiment.
> - Report observed behavior for the tested client, model and version. Do not infer support from a generated hook response alone.

This kit extends the earlier [live transport experiment](../../../docs/plans/202611/logs/787-show-authoring-rules/spike/live-transport.mjs) into a user-run protocol. The earlier files remain the record of the original blocked spike. This kit does not launch an agent, load credentials, contact a service or modify production hooks. The user opens the synthetic workspace in their chosen host, which processes that workspace through its normal account and permissions.

The [2026-11-03 report](reports/bkit-hook-probe-report-2026-11-03.md) links the preserved results for all five hosts. This manual compatibility experiment is outside normal CI; the local integration checks below validate only the collector.

## Run it

From the bkit checkout, generate a new workspace for a host:

```sh
node tests/experiments/hooks/bkit-hook-probe.mjs setup codex tmp/authoring-probe-codex
```

Replace `codex` in both positions with `cursor`, `claude`, `antigravity` or `opencode`. Node 24 and Git are needed; no package installation is needed. Each destination must be absent. The generator initializes an empty Git repository with no templates, so the host sees a separate project root rather than the parent checkout. It creates no commit or remote. Repeating a run requires a new destination, so earlier evidence is preserved. Generated hook commands contain local absolute paths: regenerate rather than move a workspace to another computer.

1. Open the generated folder as the host's workspace, not as a subfolder in the existing bkit chat.
2. Review and enable its project hooks through the host's normal trust flow. Do not bypass trust.
3. Start a fresh chat after enabling the hooks.
4. Paste this prompt:

```text
Read RUN.md and carry out this synthetic hook experiment in this workspace.
Use separate, sequential tool calls. Do not inspect the probe source, hook
configuration, private evidence or spilled hook output to recover markers.
Do not repair hooks or bypass permissions. Record the actual client, version
and model, using unknown where necessary. Return results.json and name any
unavailable tools or hook-loading problems. No commits or pushes.
```

5. Return each workspace's `results.json`. Keep the chat available if a result needs a timing check. The JSON contains no raw commands, source, credentials, transcript paths or private marker values.

## Host setup and tested routes

<!-- prettier-ignore -->
| Host | Workspace configuration | Routes |
| --- | --- | --- |
| Codex | `.codex/hooks.json` beside `.codex/config.toml`; trust the project and review the exact hook in `/hooks`. | `PreToolUse.additionalContext` for native edits and shell calls. |
| Cursor | `.cursor/hooks.json`; open as a trusted workspace. | Native edits compare `agent_message` on allow against the existing `additional_context` envelope. Shell uses `beforeShellExecution.agent_message`. Both edit routes are experiments; neither is assumed to work. |
| Claude Code | `.claude/settings.json`; inspect `/hooks` in the new project. | `PreToolUse.additionalContext` for native edits and shell calls. |
| Antigravity | `.agents/hooks.json`; use the Hooks settings or `/hooks`. | Compare allow/reason against the existing deny-once delivery for edits and shell calls. A denied test call is acknowledged and retried once. This does not propose a new production blocking policy. |
| OpenCode | `opencode.json` explicitly loads a local plugin with V1 `server()` and V2 `setup()` entry points. | Records a before event and appends the advisory after execution as a control. It cannot count as before-edit delivery. Unsupported plugin versions remain a loading limitation. |

The generator creates eight cases per host, twelve for Cursor and sixteen for Antigravity. Each route receives 1,200, 8,000, 12,000 and 32,000 ASCII characters. Run cases one at a time; a whole-run rerun uses a fresh workspace.

## What the evidence means

The hook generates three random markers only when the requested target edit reaches it. The model acknowledges markers visible in the delivered advisory. The acknowledgement command snapshots whether that target still contains `BEFORE` or has changed to `AFTER`.

<!-- prettier-ignore -->
| Result | Interpretation |
| --- | --- |
| `NO_HOOK_OBSERVED` | No matching hook event was captured for that case. An edited target does not turn this into successful delivery. Check loading, trust and the actual tool name. |
| `UNVERIFIED_NO_VALID_ACK` | The hook may have emitted advice, but no correct marker was acknowledged. Dropped output and model noncompliance are not distinguished. |
| `ACK_BEFORE_EDIT` | The model acknowledged a fresh marker while the target still held its original contents. Check `denyOnce` to distinguish advisory-only behavior from an intentional hold. |
| `ACK_AFTER_EDIT` | A correct marker was acknowledged after the target changed. This does not prove that earlier model receipt was impossible. |
| `ACK_AFTER_TOOL_NO_EDIT` | An after-execution advisory was acknowledged while the target remained unchanged. This is a no-op or unsuccessful-edit control, not before-edit delivery. |
| `ALL_THREE_MARKERS_ACKNOWLEDGED` | The model returned all three sampled positions. This does not prove every intervening byte arrived. |
| `PARTIAL_MARKERS_ACKNOWLEDGED` | Some marker positions were returned. This is not proof of complete delivery or proof that the host truncated it. |

These are observations, not a security protocol against a deliberately cheating agent. The prompt forbids recovering markers from private files or spill files. Record protocol violations as invalid evidence. The report never upgrades missing acknowledgements into failure-of-host or success-of-delivery claims.

The sizes are character counts, not exact token boundaries. Filler tokenization, model behavior, host settings and host versions affect results. The kit does not enumerate every edit tool, validate the future shell detector, prove consumer upgrade wiring, or measure exactly-once state under concurrency. It addresses the two remaining live transport/visibility questions; production coverage still needs its planned tests.

## Local verification

```sh
node --test tests/experiments/hooks/bkit-hook-probe.test.mjs
```

The local integration checks exercise real scratch files, CLI calls, host payload shapes and the OpenCode plugin callbacks. They verify the collector, not live host delivery. Live observations are recorded separately in the dated report.

## Sources checked

- [Codex hooks: locations, trust and context output](https://learn.chatgpt.com/docs/hooks).
- [Cursor hooks: workspace trust, preToolUse and beforeShellExecution](https://cursor.com/docs/hooks).
- [Claude Code hooks: project settings and PreToolUse context](https://code.claude.com/docs/en/hooks).
- [Antigravity hooks: workspace configuration and toolCall payload](https://antigravity.google/docs/hooks).
- [OpenCode server plugins: before/after tool events and V1 compatibility](https://dev.opencode.ai/v2/docs/build/plugins/server/).

Checked on 2026-11-02. The source adapters also follow the repository's shared hook contracts. Hooks remain version-sensitive; a failure to load is evidence to inspect, not permission to invent a replacement API.
